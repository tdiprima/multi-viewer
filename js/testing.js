function hasEqualStructure (obj1, obj2) {
  return Object.keys(obj1).every(key => {
    const v = obj1[key]

    if (typeof v === 'object' && v !== null) {
      return hasEqualStructure(v, obj2[key])
    }

    return Object.prototype.hasOwnProperty.call(obj2, key)
  })
}

// eslint-disable-next-line no-unused-vars
function toMatchStructure (actual, expected) {
  const pass = hasEqualStructure(actual, expected)
  const message = `expected ${JSON.stringify(expected)} to match structure ${JSON.stringify(actual)}`
  console.log('pass', pass)
  console.log('message', message)
}

const actual = {
  foo: 1,
  bar: 2,
  bas: {
    baz: 3
  }
}

const expected = {
  foo: 1,
  bar: 2,
  zoo: 4,
  bas: {
    baz: 3
  }
}

// const actual = {
//   brand: 'brand 1',
//   navigation: { opacity: 0.2 }
// }
//
// const expected = {
//   brand: 'brand 2',
//   navigation: { opacity: 0.5 }
// }

// toMatchStructure(actual, expected)

for (const key in expected) {
  if (actual.hasOwnProperty(key)) {
    console.log(key)
  } else {
    console.log(key, 'not exist')
    actual[key] = expected[key]
  }
}
console.log(actual)
