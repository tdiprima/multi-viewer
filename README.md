# n-viewer
Goal: Inter-locklable N-viewers synchronized together, with clean, light-weight, reusable, modular code

List of products: https://quip.bmi.stonybrook.edu/tcgaseg/demo.html

Those are different instances of the N-Viewer.  The only difference is the number of viewers being passed in to the program.  The # of viewers that we want displayed.

### Viewer
A viewer object has a filter, sliders, and a viewer!

* setFilter
* setSliders
* setViewer

### Dropdown
Images and Cancer types

* imageExists
* initialize
* initImages
* initTypes
* selectCancerType
* selectImage

### Synchronizer
Coordinates the viewers on a page
* handler
