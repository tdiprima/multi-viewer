const pageSetup = function (numDivs, sourceImages, options) {
  let viewers = [] // eslint-disable-line prefer-const
  const rangeSliders = new Sliders()
  const page = new Page()

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {

      return resolve(checkOptions(options))
    }).then(function (options) {
      // Create divs
      let idx
      for (idx = 1; idx <= numDivs; idx++) {
        page.createDivs(idx, numDivs, viewers, rangeSliders, options)
      }
      return viewers
    }).then(function (viewers) {
      // Viewers created; add dropdown to page
      // eslint-disable-next-line no-new
      new DropDown(viewers, 'selections', 'json/tcga.json')
      return viewers
    }).then(function (viewers) {
      // Pan zoom controller
      synchronizeViewers(viewers)
    }).then(function (result) {
      if (sourceImages.length === 1) {
        // Testing
        viewers.forEach(function (elem) {
          elem.getViewer().open(sourceImages[0]) // <- open()
        })
      } else {
        // Set viewer source
        viewers.forEach(function (elem) {
          elem.setSources(sourceImages, [1.0, 1.0]) // <- setSources()
        })
      }
    })
  })
}
