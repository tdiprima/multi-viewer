// let myTiles = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi'
myTiles = {
  '@context': 'http://iiif.io/api/image/2/context.json',
  '@id': window.location.origin + '/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs',
  height: 105472,
  width: 135168,
  profile: ['http://iiif.io/api/image/2/level2.json'],
  protocol: 'http://iiif.io/api/image',
  tiles: [{
    width: 256,
    height: 256,
    scaleFactors: [
      1,
      2,
      4,
      8,
      16,
      32,
      64,
      128,
      256,
      512
    ]
  }]
}
