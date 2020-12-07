// THIS FUNCTION WILL BE GOING AWAY, EVENTUALLY.
// DropDown Module
const DropDown = function (viewerArray, divId, dataSource) {
  const cancertypes = ['blca', 'brca', 'cesc', 'gbm', 'luad', 'lusc', 'paad', 'prad', 'skcm', 'ucec']
  const maindiv = document.getElementById(divId)
  const iiif = window.location.origin + '/iiif/?iiif=/tcgaseg'
  let cancerSelect = {}
  let imageSelect = {}
  const data = {}

  // Uglification fail
  // fetch(dataSource).then(response => {
  //   const contentType = response.headers.get('content-type')
  //   if (contentType && contentType.indexOf('application/json') !== -1) {
  //     return response.json().then(data => {
  //       // Process JSON data
  //       if (!isEmpty(data)) {
  //         initTypes()
  //         initImages(data)
  //       } else {
  //         throw Error('\n    Empty JSON response.\n    Skipping drop-down creation.')
  //       }
  //     })
  //   } else {
  //     return response.text().then(text => {
  //       console.log('text:', text)
  //       throw Error('We got a response... but it was not JSON.')
  //     })
  //   }
  // })
  fetch(dataSource).then(function (response) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json().then(function (data) {
        // Process JSON data
        if (!isEmpty(data)) {
          initTypes()
          initImages(data)
        } else {
          throw Error('\n    Empty JSON response.\n    Skipping drop-down creation.')
        }
      })
    } else {
      return response.text().then(function (text) {
        console.log('text:', text)
        throw Error('We got a response... but it was not JSON.')
      })
    }
  })

  function selectCancerType () {
    const val = cancerSelect.value
    imageSelect.options.length = 0
    const nl = data[val]
    let i
    for (i = 0; i < nl.length; i++) {
      const option = document.createElement('option')
      option.text = nl[i].id
      imageSelect.add(option)
    }
    console.log('You selected: ' + val + ' which has ' + imageSelect.options.length + ' images')
    selectImage()
  }

  function imageExists (imageUrl) {
    const http = new XMLHttpRequest()
    http.open('HEAD', imageUrl, false)
    http.send()
    return http.status !== 404
  }

  function selectImage () {
    const cVal = cancerSelect.value
    const iVal = imageSelect.value
    console.log('setting viewer to image : ' + iVal)
    const ti = iiif + '/tcgaimages/' + cVal + '/' + iVal + '.svs/info.json'
    const si = iiif + '/featureimages/' + cVal + '/' + iVal + '-featureimage.tif/info.json'

    if (imageExists(ti)) {
      viewerArray.forEach(function (elem) {
        elem.getViewer().open([ti, si])
      })
    } else {
      alertMessage('Image does not exist\n' + ti)
      return false
    }
  }

  function initTypes () {
    const d = document.createDocumentFragment()
    const newDiv = document.createElement('div')
    newDiv.innerHTML = 'Type&nbsp;'
    d.appendChild(newDiv)
    cancerSelect = document.createElement('select')
    cancerSelect.id = 'cancertype'
    cancertypes.forEach(function (item) {
      const opt = document.createElement('option')
      opt.innerHTML = item
      opt.value = item
      cancerSelect.appendChild(opt)
    })
    cancerSelect.addEventListener('change', selectCancerType)
    newDiv.appendChild(cancerSelect)
    maindiv.appendChild(d)
  }

  function initImages (data) {
    const images = data[cancertypes[0]]
    if (typeof images !== 'undefined') {
      const d = document.createDocumentFragment()
      const newDiv = document.createElement('div')
      newDiv.innerHTML = 'Image&nbsp;'
      d.appendChild(newDiv)
      imageSelect = document.createElement('select')
      imageSelect.id = 'imageids'

      images.forEach(function (item) {
        const opt = document.createElement('option')
        opt.innerHTML = item.id
        opt.value = item.id
        imageSelect.appendChild(opt)
      })
      imageSelect.addEventListener('change', selectImage)
      newDiv.appendChild(imageSelect)
      maindiv.appendChild(d)
    }
  }
}
