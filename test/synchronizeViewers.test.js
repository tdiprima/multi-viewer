// Oct 14, 2020
// node synchronizeViewers.test.js
// Note: This test is designed to fail.
const synchronizeViewers = require('./src/synchronizeViewers');

console.log('\nTest empty array');
synchronizeViewers([]);

console.log('\nTest non-viewer array elements');
synchronizeViewers(['a', 'b', 'c']);
