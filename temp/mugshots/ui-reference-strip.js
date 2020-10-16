(function () {
  window.addEventListener('load', function () {
    const exampleImages = 'https://openseadragon.github.io/example-images'
    OpenSeadragon({
      id: 'contentDiv',
      prefixUrl: '//openseadragon.github.io/openseadragon/images/',
      sequenceMode: true,
      showReferenceStrip: true,
      tileSources: [
        exampleImages + '/highsmith/highsmith.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05954.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05955.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05956.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05957.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05958.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05959.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05960.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05961.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05962.dzi',
        exampleImages + '/pnp/ppmsca/05900/05954/05963.dzi'
      ]
    })
  })
})()
