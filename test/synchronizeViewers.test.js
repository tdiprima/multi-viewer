// Oct 14 16:36:55 2020
const synchronizeViewers = require('./src/synchronizeViewers');

console.log('Test empty array');
synchronizeViewers([]);

console.log('Test non-viewer array elements');
synchronizeViewers(['a', 'b', 'c']);