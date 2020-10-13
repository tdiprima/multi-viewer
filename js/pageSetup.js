// eslint-disable-next-line no-unused-vars
const pageSetup = function (numDivs, prod1, sourceImages, options1) {
  let prod
  let viewers = [] // eslint-disable-line prefer-const
  const rangeSliders = new Sliders() // eslint-disable-line no-undef
  const page = new Page() // eslint-disable-line no-undef

  document.addEventListener('DOMContentLoaded', function () {
    prod = prod1

    new Promise(function (resolve, reject) {
      const options = checkOptions(options1) // eslint-disable-line no-undef
      return resolve(options)
    }).then(function (options) {
      // Create divs
      for (let idx = 1; idx <= numDivs; idx++) {
        page.createDivs(idx, numDivs, viewers, rangeSliders, options)
      }
      return viewers
    }).then(function (viewers) {
      // Viewers created; add dropdown to page
      dropdown(viewers, 'selections', 'json/tcga.json') // eslint-disable-line no-undef
      return viewers
    }).then(function (viewers) {
      // Pan zoom controller
      synchronizeViewers(viewers) // eslint-disable-line no-undef
    }).then(function (result) {
      function test () {
        // TESTING
        viewers.forEach(function (elem) {
          elem.getViewer().open(sourceImages[0]) // <- open()
        })
      }

      function live () {
        // Set viewer source
        viewers.forEach(function (elem) {
          elem.setSources(sourceImages, [1.0, 1.0]) // <- setSources()
        })
      }

      if (prod) {
        live()
      } else {
        test()
      }
    })
  })
}
