function brcaItems(toggle) {
  let img = 'brca/TCGA-3C-AALI-01Z-00-DX1.F6E9A5DF-D8FB-45CF-B4BD-C6B76294C291'
  let loc = window.location.origin
  let base = {
    layerNum: 0,
    location: `${loc}/iiif/?iiif=/tcgaseg/tcgaimages/${img}.svs/info.json`,
    opacity: 1
  }
  if (toggle) {
    return [base, {
      layerNum: 1,
      location: `${loc}/iiif/?iiif=/tcgaseg/featureimages/${img}-featureimage.tif/info.json'`,
      opacity: 1,
      colors: [{color: 'rgba(245, 0, 7, 255)', low: 0, hi: 85}, {
        color: 'rgba(92, 0, 161, 255)',
        low: 86,
        hi: 171
      }, {color: 'rgba(10, 0, 244, 255)', low: 172, hi: 255}]
    }]
  } else {
    return [base, {
      layerNum: 1,
      location: `${loc}/iiif/?iiif=/tcgaseg/featureimages/brca/TCGA-3C-AALJ-01Z-00-DX1.777C0957-255A-42F0-9EEB-A3606BCF0C96-featureimage.tif/info.json`,
      opacity: 1,
      colors: [{color: 'rgba(254, 213, 2, 255)', low: 0, hi: 85}, {
        color: 'rgba(227, 98, 53, 255)',
        low: 86,
        hi: 171
      }, {color: 'rgba(60, 1, 114, 255)', low: 172, hi: 255}]
    }]
  }
}

function testItems(toggle) {
  let img = '//openseadragon.github.io/example-images/duomo/duomo.dzi'
  let base = {
    layerNum: 0,
    location: img,
    opacity: 0.5
  }
  if (toggle) {
    return [base, {
      layerNum: 1,
      location: img,
      opacity: 0.7,
      colors: [{color: 'rgba(245, 0, 7, 255)', low: 0, hi: 85}, {
        color: 'rgba(92, 0, 161, 255)',
        low: 86,
        hi: 171
      }, {color: 'rgba(10, 0, 244, 255)', low: 172, hi: 255}]
    }]
  } else {
    return [base, {
      layerNum: 1,
      location: img,
      opacity: 0.7,
      colors: [{color: 'rgba(254, 213, 2, 255)', low: 0, hi: 85}, {
        color: 'rgba(227, 98, 53, 255)',
        low: 86,
        hi: 171
      }, {color: 'rgba(60, 1, 114, 255)', low: 172, hi: 255}]
    }]
  }
}

const options = {
  toolbarOn: true,
  paintbrushColor: '#0ff'
}

// 2 VIEWERS.  Each element represents each viewer's array of images to be displayed.
let images = [testItems(true), testItems(false)]
// let images = [brcaItems(true), brcaItems(false)]
pageSetup('contentDiv', images, 2, 1, 2, 640, 480, options)

// 1 VIEWER.
// let viewerSlides = [itemsToBeDisplayed]
// pageSetup('contentDiv', viewerSlides, 1, 1, 1, 640, 480, options)
