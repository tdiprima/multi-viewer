const synchronizeViewers = require('../js/synchronizeViewers')

console.log('Test empty array')
synchronizeViewers([])

console.log('Test non-viewer array elements')
synchronizeViewers(['a', 'b', 'c'])
