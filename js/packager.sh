#!/bin/bash

rm ../dist/ultraviewer.min.js

function manual_minify() {
  subl ../dist/ultraviewer.min.js vendor/ultraviewer.author.js
  open https://javascript-minifier.com/
}

function foo() {
  cat colorPicker.js commonFunctions.js dropDown.js checkOptions.js rangeSliders.js createPage.js pageSetup.js editPolygon.js drawPolygon.js gridOverlay.js mapMarker.js markupTools.js ImageViewer.js synchronizeViewers.js >../dist/ultraviewer.min.js
  #find . -type f -name '*.js' -maxdepth 1 -exec cat {} \; >output
  mv output ../dist/ultraviewer.min.js
  #minify
  manual_minify
}
foo

function minify() {
  $HOME/Documents/workspace/minify/bin/minifyjs ultraviewer.min.js >temp.js
  rm ultraviewer.min.js
  mv temp.js ultraviewer.min.js
}

echo 'Done.'
