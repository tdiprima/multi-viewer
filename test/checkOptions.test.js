const makeStructuresEqual = require('../js/checkOptions')
let result

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

result = makeStructuresEqual(expected, actual)
console.log(result)

const obj1 = {
  brand: 'brand 1',
  navigation: { opacity: 0.2 }
}

const obj2 = {
  brand: 'brand 2',
  navigation: { opacity: 0.5 }
}

result = makeStructuresEqual(obj1, obj2)
console.log(result)

const weNeedTheseKeys = {
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

result = makeStructuresEqual(weNeedTheseKeys, toMatch)
console.log(result)
