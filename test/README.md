## Things to do prior to testing:

In folder `src`...

1. Uncomment any `module.exports` statements.
2. Uncomment any `require` statements.

*Had to remove comments because package manager decided to READ the comments #:(*

Therefore, add...

### synchronizeViewers.js

```js
const isEmpty = require('../src/commonFunctions');
module.exports = synchronizeViewers;
```

### commonFunctions.js

```js
module.exports = isEmpty;
```

### How to test:

* Using regular `node` to test.
* For web testing, install `selenium-webdriver`.
