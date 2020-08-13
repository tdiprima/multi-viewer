#!/bin/bash

rm myPackage.js ultraviewer.min.js
cat color.js demo.js dropdown.js locationPin.js markupTools.js nViewer.js synchronizer.js toolbar.js >myPackage.js
$HOME/Documents/workspace/minify/bin/minifyjs myPackage.js >temp.js

cat ultraviewer.author.js temp.js >ultraviewer.min.js
rm temp.js myPackage.js
subl ultraviewer.min.js
