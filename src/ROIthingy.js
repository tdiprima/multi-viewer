const ROIthingy = function (divId, image, rois, rows, columns) {
  var table = document.createElement('table')

  for (var i = 0; i <= columns; i++) {
    var cell = 'cell' + i
    cell = row.insertCell(i)
    if (i % rows == 0) {
      var row = table.insertRow(rowCount)
    }
  }
}
