function checkOptions (options, numDivs) {

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

  if (isRealValue(options)) {
    returnValue = objCompare(weNeedTheseKeyValPairs, options)

  } else {

    // Design decision:
    if (numDivs === 1) {
      // single viewer
      returnValue.toolbarOn = false
    } else {
      // multiple viewers
      returnValue.viewerOpts.showFullPageControl = false
      returnValue.viewerOpts.showZoomControl = false
    }
  }
  return returnValue
}

function objCompare (obj1, obj2) {
  let same = true
  for (let [key, value] of Object.entries(obj1)) {
    if (typeof value === 'object') {
      same = objCompare(obj1[key], obj2[key])
    } else {
      if (obj1[key] !== obj2[key]) same = false
    }
  }

  return same
}
