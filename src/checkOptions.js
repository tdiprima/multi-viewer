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

  const empty = isEmpty(options)
  if (!empty) {
    returnValue = makeStructuresEqual(weNeedTheseKeys, options)
  } else {
    return weNeedTheseKeys
  }
  return returnValue
}

function addKeyValue(expected, actual, key) {
  actual[key] = expected[key]
}

function makeStructuresEqual(expected, actual) {
  if (actual === null || typeof actual === 'undefined') {
    return expected
  } else {
    let key
    for (key in expected) {
      if (!Object.prototype.hasOwnProperty.call(actual, key)) {
        addKeyValue(expected, actual, key)
      }
    }
    return actual
  }
}

// Uncomment lines while testing:
// const isEmpty = require('../js/commonFunctions')
// Uncomment line while testing:
// module.exports = checkOptions // <- Either THIS...
// module.exports = makeStructuresEqual // <- OR THAT.
