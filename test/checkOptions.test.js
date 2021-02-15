const checkOptions = require('../src/checkOptions')
let result

console.debug('\nTest non-empty:')
result = checkOptions({ foo: 1 })
console.log('result:', result)

console.debug('\nTest null:')
result = checkOptions(null)
console.log('result:', result)

console.debug('\nTest empty:')
result = checkOptions({})
console.log('result:', result)
