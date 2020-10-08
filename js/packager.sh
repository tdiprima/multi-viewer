#!/bin/bash

rm ../dist/ultraviewer.min.js

cat colorPicker.js commonFunctions.js dropdown.js pageSetup.js editPolygon.js drawPolygon.js gridOverlay.js mapMarker.js markupTools.js ImageViewer.js synchronizeViewers.js > ../dist/ultraviewer.min.js
#manual_minify


function foo() {
  find . -type f -name '*.js' -maxdepth 1 -exec cat {} \; >output
  mv output ../dist/ultraviewer.min.js
  #minify
  manual_minify
}


function minify() {
  $HOME/Documents/workspace/minify/bin/minifyjs ultraviewer.min.js >temp.js
  rm ultraviewer.min.js; mv temp.js ultraviewer.min.js
}


function manual_minify() {
  subl ../dist/ultraviewer.min.js vendor/ultraviewer.author.js
  open https://javascript-minifier.com/
}

echo 'Done.'
