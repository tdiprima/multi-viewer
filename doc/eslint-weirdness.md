## ESLint weirdness

1. `<!DOCTYPE html>` breaks ESLint standard, and yet the code is correct, per [Modern DOCTYPE
](https://webhint.io/docs/user-guide/hints/hint-doctype/).

2. `no-unused-vars` will be triggered a lot, particularly because it doesn't know about the other scripts.

Example: `colorPicker` is defined but never used.

Sure, it is.  See quad.html and pageSetup.js.

