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
  if (!empty) {
    returnValue = makeStructuresEqual(weNeedTheseKeys, options)
  } else {
    return options
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

// module.exports = makeStructuresEqual // FOR TESTING
