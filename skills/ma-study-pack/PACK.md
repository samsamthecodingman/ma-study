# Quiz pack format

A pack is one JSON file that the Study Hub imports (Settings, Features, Quiz packs, Import). Importing a pack with ids that already exist updates those items, so use stable ids and you can fix or extend a pack later.

## Shape

```
{ "format": "ma-study-pack", "version": 1, "title": "optional",
  "concepts":  { "<id>": { ... } },
  "questions": { "<id>": { ... } },
  "quizzes":   { "<id>": { ... } },
  "exams":     { "<id>": { ... } },
  "meta":      { "<unit lowercase>": { ... } } }
```

`format` and `version` are required. Every collection is optional, but those five are the only ones allowed.

## Items

Every item needs a non-empty `"unit"` string of at most 40 characters, like `"ECE4179"`.

**concept**: `unit`, `week` (number), `name` (non-empty, up to 200 characters), `order` (number, for sorting in the week).

**question**: `unit`, `week`, `concepts` (array of concept id strings), `w` (label like `"W11 · Positional encoding"`), `q` (question HTML, required), then exactly one kind of answer:
- Multiple choice: `o` (2 to 4 option strings) and `a` (0-based index of the right option).
- Numeric: `num` (a finite number) and optionally `tol` (a number of 0 or more, the allowed error).
- Written: `ans` (non-empty model answer HTML). Written questions only appear in exams, not in quizzes or weak-spot revision.

Optional on any question: `e` (explanation), `s` (source, like `"slide · Transformers p.14"`), `link`.

**link** (optional): `{ "v": { "id": "<Panopto video uuid>", "t": <seconds>, "title": "..." }, "d": { "deck": "<deck name>", "f": "<Google Drive file id>", "p": [6] } }`. Either part can be left out. Video links only show for Monash Panopto ids and Drive links only for Drive file ids. Do not invent ids.

**quiz**: `unit`, `title` (non-empty, up to 200 characters), `qids` (non-empty array of question ids), optional `created` (ISO date).

**exam**: `unit`, `title`, `qids` (as for a quiz), optional `minutes` (above 0), `marks` (object of question id to marks, default 1 each), `intro` (HTML).

**meta**: keyed by the unit in lowercase. `unit`, `name` (the unit title), `examDate` (like `"2026-11-12T10:30"`).

## Rules the importer checks

- Ids match `^[A-Za-z0-9][\w.-]{0,99}$`. Use unit-prefixed ids: `ece4179-w11-q03` for questions and concepts, `ece4179-w11-12` for a quiz.
- Questions need a non-empty `q` and one valid kind of answer (above).
- `concepts` on a question is an array of strings. `e`, `s` and `w` are strings.
- Strings are at most 20000 characters. Each option is at most 4000.
- A quiz or exam may only list question ids that exist, in the pack or already in the hub. The checker script here needs them in the pack, since it has no hub.
- At most 3000 items in total. The file is at most 5 MB.
- The pack is rejected if there is an error. Nothing is partly imported.

## HTML and maths

`q`, `ans`, options, `e` and `intro` may use only these tags: `b i em strong sub sup br p ul ol li code pre span div table thead tbody tr th td`. The hub removes everything else. Put maths in `\( ... \)` (inline) or `\[ ... \]` (display). In JSON every backslash is doubled: `\\( x^2 \\)`.

## Example

```json
{
  "format": "ma-study-pack",
  "version": 1,
  "title": "ECE4179 week 11",
  "concepts": {
    "ece4179-w11-posenc": { "unit": "ECE4179", "week": 11, "name": "Positional encoding", "order": 1 },
    "ece4179-w11-attn": { "unit": "ECE4179", "week": 11, "name": "Self-attention", "order": 2 }
  },
  "questions": {
    "ece4179-w11-q01": {
      "unit": "ECE4179", "week": 11, "concepts": ["ece4179-w11-posenc"],
      "w": "W11 · Positional encoding",
      "q": "Why does a transformer add positional encodings to its input embeddings?",
      "o": ["Self-attention alone ignores token order", "To reduce the embedding size", "To make attention run faster", "To replace the softmax"],
      "a": 0,
      "e": "Attention treats its input as a set, so without position information, shuffling the tokens gives the same output. The other options are not what the encoding is for.",
      "s": "slide · Transformers p.14"
    },
    "ece4179-w11-q02": {
      "unit": "ECE4179", "week": 11, "concepts": ["ece4179-w11-attn"],
      "w": "W11 · Self-attention",
      "q": "A query and key have \\(d_k = 64\\). By what number do we divide \\(QK^T\\) before the softmax?",
      "num": 8, "tol": 0,
      "e": "We divide by \\(\\sqrt{d_k} = 8\\) so the dot products do not grow with \\(d_k\\).",
      "s": "slide · Transformers p.11"
    },
    "ece4179-w11-q03": {
      "unit": "ECE4179", "week": 11, "concepts": ["ece4179-w11-attn"],
      "w": "W11 · Self-attention",
      "q": "Explain why self-attention is permutation equivariant.",
      "ans": "<p>Each output is a weighted sum of values, and the weights depend only on query-key dot products. Reordering the inputs reorders the outputs the same way.</p>",
      "e": "Marking points: weighted sum of values; weights depend on content only, not position.",
      "s": "slide · Transformers p.12"
    }
  },
  "quizzes": {
    "ece4179-w11": {
      "unit": "ECE4179", "title": "Week 11: Transformers",
      "qids": ["ece4179-w11-q01", "ece4179-w11-q02"],
      "created": "2026-11-06"
    }
  },
  "meta": {
    "ece4179": { "unit": "ECE4179", "name": "Neural Networks and Deep Learning", "examDate": "2026-11-12T10:30" }
  }
}
```

(The written question is not in the quiz, since written questions are exam-only. Put it in an `exams` item to use it.)

Check a pack with `node check-pack.js your-pack.json`.
