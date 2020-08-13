#!/bin/bash

rm myPackage.js ultraviewer.min.js
cat color.js demo.js dropdown.js locationPin.js markupTools.js nViewer.js synchronizer.js toolbar.js >myPackage.js
$HOME/Documents/workspace/minify/bin/minifyjs myPackage.js >ultraviewer.min.js
subl ultraviewer.author.js ultraviewer.min.js
