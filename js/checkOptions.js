// eslint-disable-next-line no-unused-vars
const checkOptions = function (options) {
  let returnValue
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

  const empty = isEmpty(options) // eslint-disable-line no-undef
  console.log('options:', options)
  console.log('empty?', empty)
  if (!empty) {
    returnValue = makeStructuresEqual(weNeedTheseKeys, options)
  } else {
    return weNeedTheseKeys
  }
  return returnValue
}

function addKeyValue (expected, actual, key) {
  actual[key] = expected[key]
}

function makeStructuresEqual (expected, actual) {
  for (const key in expected) {
    if (!Object.prototype.hasOwnProperty.call(actual, key)) {
      addKeyValue(expected, actual, key)
    }
  }
  return actual
}

// Uncomment lines while testing:
// const isEmpty = require('../js/commonFunctions')
// module.exports = checkOptions
// OR: module.exports = makeStructuresEqual
