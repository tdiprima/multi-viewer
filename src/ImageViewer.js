class ImageViewer extends SmallViewer {
  constructor (viewerDivId, imageArray, opacityArray, sliderElements, numDivs, options) {
    super(viewerDivId, imageArray, opacityArray)
    console.log(typeof sliderElements === 'undefined')
    let viewer1 = super.getViewer()
    console.log(viewer1)
  }
}
