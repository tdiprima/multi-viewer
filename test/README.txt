Things to do prior to testing:

In folder 'src', top-level only...
1. Uncomment any 'module.exports' statements.
2. Uncomment any 'require' statements.

Had to remove comments because package manager decided to READ the comments #:(

So add...

checkOptions.js:
const isEmpty = require('../src/commonFunctions')
// Uncomment line while testing:
// module.exports = checkOptions // <- Either THIS...
// module.exports = makeStructuresEqual // <- OR THAT.

synchronizeViewers.js:
const isEmpty = require('../src/commonFunctions')
module.exports = synchronizeViewers

commonFunctions.js:
module.exports = isEmpty

How to test:
Using regular node to test.
For web testing, install selenium-webdriver.
