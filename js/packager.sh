#!/bin/bash


rm ultraviewer.min.js
#find . -type f -name '*.js' -maxdepth 1 -exec cat {} \; > output

cat color.js dropdown.js pageSetup.js edit.js locationPin.js markupTools.js nViewer.js synchronizer.js > output
mv output ultraviewer.min.js

# $HOME/Documents/workspace/minify/bin/minifyjs ultraviewer.min.js >temp.js
# rm ultraviewer.min.js; mv temp.js ultraviewer.min.js

#subl ultraviewer.min.js lib/ultraviewer.author.js
#open https://javascript-minifier.com/
