const checkOptions = require('../js/checkOptions')
let result

result = checkOptions({ foo: 1 })
console.log(result)

result = checkOptions({})
console.log(result)

result = checkOptions(null)
console.log(result)
