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

test(expected, actual)

const obj1 = {
  brand: 'brand 1',
  navigation: { opacity: 0.2 }
}

const obj2 = {
  brand: 'brand 2',
  navigation: { opacity: 0.5 }
}

test(obj1, obj2)

const weNeedTheseKeyValPairs = {
  filterOn: true,
  slidersOn: true,
  toolbarOn: true,
  paintbrushColor: '#0ff',
  viewerOpts: {
    showFullPageControl: true,
    showHomeControl: true,
    showZoomControl: true
  }
}

const toMatch = {
  filterOn: true,
  slidersOn: true,
  toolbarOn: true,
  viewerOpts: {
    showZoomControl: true
  }
}

test(weNeedTheseKeyValPairs, toMatch)

function test (expected, actual) {
  console.log('\nExpect')
  console.log(expected)
  console.log('to match structure')
  console.log(actual)
  console.log('')

  makeStructuresEqual(expected, actual)

  console.log('New object:')
  console.log(actual)
}

function addKeyValue (expected, actual, key) {
  actual[key] = expected[key]
}

function makeStructuresEqual (expected, actual) {
  for (const key in expected) {
    // if (!actual.hasOwnProperty(key)) {
    if (typeof v === 'object' && v !== null) {
      return hasEqualStructure(v, obj2[key])
    }

    if (!Object.prototype.hasOwnProperty.call(actual, key)) {
      console.log('Key \'' + key + '\' does not exist.')
      console.log('')
      addKeyValue(expected, actual, key)
    }
  }
}
