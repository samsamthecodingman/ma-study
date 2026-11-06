#!/usr/bin/env node
// Makes a shareable copy of a Study Hub: one HTML file that runs in any browser with no Claude.
// It carries the quizzes, exams, concepts and content list, but none of the student's answers,
// progress, notes or settings. Progress in the copy saves in the browser that opens it.
//
//   node export-standalone.js <docs-dir> <out.html> [--units ECE4179,ECE4078] [--skip quizId,examId] [--pack <out.json>]
//
// <docs-dir> holds one JSON file per hub doc, as <collection>/<id>.json (what ArtifactData
// `list` with out_dir writes). --pack also writes the same content as a quiz pack (see
// ../ma-study-pack/PACK.md) that a friend can import into a copy they already have.
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else (opt._ = opt._ || []).push(args[i]);
const [dir, out] = opt._ || [];
if (!dir || !out) { console.error('usage: node export-standalone.js <docs-dir> <out.html> [--units A,B] [--skip id,id] [--pack out.json]'); process.exit(2); }

const SHARE = ['concepts', 'questions', 'quizzes', 'exams', 'meta', 'content']; // never attempts, srs, flags, progress, prefs, sittings, requests, reports, ticks, notes, sources
const units = opt.units ? new Set(opt.units.split(',').map(u => u.trim().toUpperCase()).filter(Boolean)) : null;
const keep = d => d && typeof d === 'object' && (!units || units.has(String(d.unit || '').toUpperCase()));

const seed = {};
for (const c of SHARE) {
  seed[c] = {};
  const cd = path.join(dir, c); if (!fs.existsSync(cd)) continue;
  for (const f of fs.readdirSync(cd)) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(cd, f), 'utf8'));
    if (keep(d)) seed[c][f.slice(0, -5)] = d;
  }
}
// Drop quizzes and exams that point at questions the copy doesn't have.
for (const c of ['quizzes', 'exams']) for (const [id, z] of Object.entries(seed[c])) {
  const miss = (z.qids || []).filter(q => !seed.questions[q]);
  if (miss.length) { console.warn(`skipping ${c}/${id}: ${miss.length} question(s) missing`); delete seed[c][id]; }
}
// --skip id,id leaves out quizzes or exams the owner doesn't want to share. Then keep only the
// questions a shared quiz or exam uses, and only the concepts those questions are tagged with.
for (const id of (opt.skip || '').split(',').map(s => s.trim()).filter(Boolean)) {
  if (!seed.quizzes[id] && !seed.exams[id]) console.warn(`--skip ${id}: no such quiz or exam`);
  delete seed.quizzes[id]; delete seed.exams[id];
}
const used = new Set([...Object.values(seed.quizzes), ...Object.values(seed.exams)].flatMap(z => z.qids || []));
for (const id of Object.keys(seed.questions)) if (!used.has(id)) delete seed.questions[id];
const tagged = new Set(Object.values(seed.questions).flatMap(q => q.concepts || []));
for (const id of Object.keys(seed.concepts)) if (!tagged.has(id)) delete seed.concepts[id];
// Drop the hub's "made by New" marker; it only matters to the owner's Claude.
for (const q of Object.values(seed.questions)) delete q.gen;

const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const ver = (tpl.match(/const HUB_VERSION = '([^']+)'/) || [])[1] || '';
// JSON inside <script>: escape < and the JS line separators so no string can close the tag.
const js = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Study Hub</title>
<script>window.HUB_STANDALONE = true; window.HUB_SEED = ${js(seed)};</script>
</head><body>
${tpl}
</body></html>
`;
fs.writeFileSync(out, html);
const n = c => Object.keys(seed[c]).length;
console.log(`wrote ${out} (hub ${ver}, ${(html.length / 1e6).toFixed(2)} MB): ${n('quizzes')} quizzes, ${n('exams')} exams, ${n('questions')} questions, ${n('concepts')} concepts, ${Object.keys(seed.meta).map(k => seed.meta[k].unit).join(', ') || 'no units'}`);

if (opt.pack) {
  const pack = { format: 'ma-study-pack', version: 1, title: `Study Hub export ${new Date().toISOString().slice(0, 10)}` };
  for (const c of ['concepts', 'questions', 'quizzes', 'exams', 'meta']) pack[c] = seed[c];
  fs.writeFileSync(opt.pack, JSON.stringify(pack, null, 1));
  console.log(`wrote ${opt.pack}`);
}
