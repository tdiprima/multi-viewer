#!/bin/bash


rm ultraviewer.min.js
find . -type f -name '*.js' -maxdepth 1 -exec cat {} \; > output
mv output ultraviewer.min.js
# $HOME/Documents/workspace/minify/bin/minifyjs ultraviewer.min.js >temp.js
# rm ultraviewer.min.js; mv temp.js ultraviewer.min.js
subl ultraviewer.min.js lib/ultraviewer.author.js
open https://javascript-minifier.com/
