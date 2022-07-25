// Uncomment module.exports=makeStructuresEqual in checkOptions.js and module.exports=isEqual in commonFunctions.js
const makeStructuresEqual = require('../js/checkOptions')
let result

console.log('\nTest missing (1) field:')
result = makeStructuresEqual({ foo: 1, bar: 2, zoo: 4, bas: { baz: 3 } }, { foo: 1, bar: 2, bas: { baz: 3 } })
console.log('result:', result)

console.log('\nTest equal structures; nothing to be done.')
result = makeStructuresEqual({ brand: 'brand 1', navigation: { opacity: 0.2 } }, { brand: 'brand 2', navigation: { opacity: 0.5 } })
console.log('result:', result)

console.log('\nTest null:')
result = makeStructuresEqual({ foo: 1 }, null)
console.log('result:', result)

console.log('\nTest empty:')
result = makeStructuresEqual({ foo: 1 }, {})
console.log('result:', result)
