function checkOptions (options) {
  // If they're missing a field, then add it.
  let returnValue
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

  const empty = isEmpty(options)
  if (!empty) {
    returnValue = makeStructuresEqual(weNeedTheseKeyValPairs, options)
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
