const makeStructuresEqual = require('../js/checkOptions')
let result

result = makeStructuresEqual({
  foo: 1,
  bar: 2,
  zoo: 4,
  bas: {
    baz: 3
  }
}, {
  foo: 1,
  bar: 2,
  bas: {
    baz: 3
  }
})
console.log(result)

result = makeStructuresEqual({
  brand: 'brand 1',
  navigation: { opacity: 0.2 }
}, {
  brand: 'brand 2',
  navigation: { opacity: 0.5 }
})
console.log(result)

result = makeStructuresEqual({
  filterOn: true,
  slidersOn: true,
  toolbarOn: true,
  paintbrushColor: '#0ff',
  viewerOpts: {
    showFullPageControl: true,
    showHomeControl: true,
    showZoomControl: true
  }
}, {
  filterOn: true,
  slidersOn: true,
  toolbarOn: true,
  viewerOpts: {
    showZoomControl: true
  }
})
console.log(result)

result = makeStructuresEqual({ foo: 1 }, {})
console.log(result)
