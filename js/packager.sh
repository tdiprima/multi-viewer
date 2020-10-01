#!/bin/bash

rm ultraviewer.min.js
find . -type f -name '*.js' -maxdepth 1 -exec cat {} \; > output
mv output ../dist/ultraviewer.min.js

# $HOME/Documents/workspace/minify/bin/minifyjs ultraviewer.min.js >temp.js
# rm ultraviewer.min.js; mv temp.js ultraviewer.min.js

subl ../dist/ultraviewer.min.js vendor/ultraviewer.author.js
open https://javascript-minifier.com/
