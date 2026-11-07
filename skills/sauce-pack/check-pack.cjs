#!/usr/bin/env node
// Checks a Study Sauce quiz pack. Usage: node check-pack.cjs pack.json
// Exit code 1 if there are errors. No dependencies.
const fs = require('fs');

const file = process.argv[2];
if (!file) { console.error('Usage: node check-pack.cjs pack.json'); process.exit(2); }

const errors = [], warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const ID = /^[A-Za-z0-9][\w.-]{0,99}$/;
const COLLS = ['concepts', 'questions', 'quizzes', 'exams', 'meta', 'formulas', 'terms'];
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
const isStr = (x) => typeof x === 'string';
const nonEmpty = (x) => isStr(x) && x.trim().length > 0;

let raw;
try { raw = fs.readFileSync(file); } catch (e) { console.error('Cannot read ' + file); process.exit(2); }
if (raw.length > 5 * 1024 * 1024) err('File is over 5 MB');
let pack;
try { pack = JSON.parse(raw.toString('utf8')); } catch (e) { console.error('Not valid JSON: ' + e.message); process.exit(1); }

if (!isObj(pack)) { console.error('Pack must be a JSON object'); process.exit(1); }
if (pack.format !== 'ma-study-pack') err('"format" must be "ma-study-pack"');
if (pack.version !== 1) err('"version" must be 1');
if (pack.title != null && !isStr(pack.title)) err('"title" must be a string');
for (const k of Object.keys(pack)) {
  if (!['format', 'version', 'title', ...COLLS].includes(k)) err(`Unknown top-level key "${k}" (allowed collections: ${COLLS.join(', ')})`);
}

let total = 0;
for (const c of COLLS) {
  if (pack[c] == null) continue;
  if (!isObj(pack[c])) { err(`"${c}" must be an object of id to item`); continue; }
  total += Object.keys(pack[c]).length;
}
if (total > 3000) err(`Too many items (${total}, max 3000)`);

// every string in an item: <=20000 chars (options <=4000)
function checkLengths(path, v, lim) {
  if (isStr(v)) { if (v.length > lim) err(`${path}: string over ${lim} characters`); }
  else if (Array.isArray(v)) v.forEach((x, i) => checkLengths(`${path}[${i}]`, x, lim));
  else if (isObj(v)) for (const k of Object.keys(v)) checkLengths(`${path}.${k}`, v[k], lim);
}

const get = (c) => (isObj(pack[c]) ? pack[c] : {});
const questions = get('questions'), concepts = get('concepts');

for (const c of COLLS) {
  for (const [id, d] of Object.entries(get(c))) {
    const at = `${c}/${id}`;
    if (c !== 'meta' && !ID.test(id)) err(`${at}: bad id (use letters, digits, . _ -, max 100, starts with a letter or digit)`);
    if (c === 'meta' && !nonEmpty(id)) err(`${at}: empty key`);
    if (!isObj(d)) { err(`${at}: must be an object`); continue; }
    if (!nonEmpty(d.unit) || d.unit.length > 40) err(`${at}: "unit" must be a non-empty string up to 40 characters`);
    checkLengths(at, d, 20000);
    if (Array.isArray(d.o)) d.o.forEach((o, i) => { if (isStr(o) && o.length > 4000) err(`${at}.o[${i}]: option over 4000 characters`); });

    if (c === 'concepts') {
      if (!nonEmpty(d.name) || d.name.length > 200) err(`${at}: "name" must be non-empty, up to 200 characters`);
    } else if (c === 'formulas') {
      if (!nonEmpty(d.name) || d.name.length > 200) err(`${at}: "name" must be non-empty, up to 200 characters`);
      if (!nonEmpty(d.tex) || d.tex.length > 2000) err(`${at}: "tex" (LaTeX, no delimiters) must be non-empty, up to 2000 characters`);
      if (d.concepts !== undefined && !(Array.isArray(d.concepts) && d.concepts.every(isStr))) err(`${at}: "concepts" must be an array of strings`);
    } else if (c === 'terms') {
      if (!nonEmpty(d.term) || d.term.length > 200) err(`${at}: "term" must be non-empty, up to 200 characters`);
      if (!nonEmpty(d.def) && !nonEmpty(d.simple)) err(`${at}: needs "def" (exact) and/or "simple" (plain words)`);
      if (d.aka !== undefined && !(Array.isArray(d.aka) && d.aka.every(isStr))) err(`${at}: "aka" must be an array of strings`);
      if (d.concepts !== undefined && !(Array.isArray(d.concepts) && d.concepts.every(isStr))) err(`${at}: "concepts" must be an array of strings`);
    } else if (c === 'questions') {
      if (!nonEmpty(d.q)) err(`${at}: "q" is required and must be non-empty`);
      const mc = d.o !== undefined || d.a !== undefined;
      const hasNum = d.num !== undefined, hasAns = d.ans !== undefined;
      if (mc) {
        if (!Array.isArray(d.o) || d.o.length < 2 || d.o.length > 4 || !d.o.every(isStr)) err(`${at}: "o" must be 2 to 4 strings`);
        else if (!Number.isInteger(d.a) || d.a < 0 || d.a >= d.o.length) err(`${at}: "a" must be an integer index into "o" (0 to ${d.o.length - 1})`);
      } else if (hasNum) {
        if (typeof d.num !== 'number' || !isFinite(d.num)) err(`${at}: "num" must be a finite number`);
      } else if (hasAns) {
        if (!nonEmpty(d.ans)) err(`${at}: "ans" must be a non-empty string`);
      } else err(`${at}: needs multiple choice ("o" and "a"), "num", or "ans"`);
      if (d.tol !== undefined && (typeof d.tol !== 'number' || !isFinite(d.tol) || d.tol < 0)) err(`${at}: "tol" must be a number of 0 or more`);
      if (d.concepts !== undefined && !(Array.isArray(d.concepts) && d.concepts.every(isStr))) err(`${at}: "concepts" must be an array of strings`);
      for (const k of ['e', 's', 'w']) if (d[k] !== undefined && !isStr(d[k])) err(`${at}: "${k}" must be a string`);
      if (d.why !== undefined && !(Array.isArray(d.o) && Array.isArray(d.why) && d.why.length === d.o.length && d.why.every(x => x === null || isStr(x)))) err(`${at}: "why" must be an array with one string (or null) per option`);
    } else if (c === 'quizzes' || c === 'exams') {
      if (!nonEmpty(d.title) || d.title.length > 200) err(`${at}: "title" must be non-empty, up to 200 characters`);
      if (!Array.isArray(d.qids) || d.qids.length === 0 || !d.qids.every(isStr)) err(`${at}: "qids" must be a non-empty array of question ids`);
      else for (const q of d.qids) if (!(q in questions)) err(`${at}: qid "${q}" is not in this pack's questions`);
      if (c === 'exams') {
        if (d.minutes !== undefined && !(typeof d.minutes === 'number' && d.minutes > 0)) err(`${at}: "minutes" must be a number above 0`);
        if (d.marks !== undefined && !isObj(d.marks)) err(`${at}: "marks" must be an object`);
      }
    }
  }
}

// warnings
const mcs = Object.entries(questions).filter(([, d]) => isObj(d) && Array.isArray(d.o) && Number.isInteger(d.a));
if (mcs.length >= 3 && new Set(mcs.map(([, d]) => d.a)).size === 1) warn(`All ${mcs.length} multiple choice answers are at position ${mcs[0][1].a}. Shuffle them.`);
for (const c of ['concepts', 'questions', 'quizzes', 'exams', 'formulas', 'terms']) {
  for (const [id, d] of Object.entries(get(c))) {
    if (!isObj(d) || !nonEmpty(d.unit)) continue;
    if (!id.toLowerCase().startsWith(d.unit.toLowerCase())) warn(`${c}/${id}: id should start with the unit, like "${d.unit.toLowerCase()}-..."`);
  }
}
const missing = new Set();
for (const [id, d] of [...Object.entries(questions), ...Object.entries(get('formulas')), ...Object.entries(get('terms'))]) {
  if (isObj(d) && Array.isArray(d.concepts)) for (const k of d.concepts) if (isStr(k) && !(k in concepts)) missing.add(k);
}
if (missing.size) warn(`Concepts used but not defined in this pack (fine only if already in your hub): ${[...missing].join(', ')}`);

for (const m of warnings) console.log('warning: ' + m);
for (const m of errors) console.log('error: ' + m);
console.log(`${total} items. ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) process.exit(1);
console.log('OK');
