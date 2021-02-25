/**
 * Set up web page for multi-viewer.
 * @param numViewers: Total number of viewers.
 * @param srcImgPair: Source image pair (array of base image + layer image)
 * @param options: Filters, paintbrush, sliders, etc.
 */
const pageSetup = function (numViewers, srcImgPair, options) {
  let viewers = [] // eslint-disable-line prefer-const
  const rangeSliders = new Sliders()
  const page = new Page()

  document.addEventListener('DOMContentLoaded', function () {
    new Promise(function (resolve, reject) {
      return resolve(checkOptions(options))
    }).then(function (options) {
      // Create divs for osd viewers
      let idx
      for (idx = 1; idx <= numViewers; idx++) {
        page.createDivs(idx, numViewers, viewers, srcImgPair, rangeSliders, options)
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
    })
  })
}
