const ROIalchemy = function (divId, image, rois, rows, columns) {
  createTable(rows, columns)
}

function createTable(rows, columns, divId) {
  let rn = parseInt(rows, 10)
  let cn = parseInt(columns, 10)
  if (isNaN(rn)) {
    rn = 1
  }
  if (isNaN(cn)) {
    cn = 1
  }
  if (isNaN(rn) || isNaN(cn)) {
    console.warn('HEY, YOU!\nYou gave me an alpha character for rows/columns.\nSo I\'m gonna do \"whatever\" now. :p')
  }
  let div = document.getElementById(divId)
  let element = document.createElement('table')
  element.id = "myTable"
  for (let r = 0; r < rn; r++) {
    let x = element.insertRow(r)
    for (let c = 0; c < cn; c++) {
      let y = x.insertCell(c)
      y.innerHTML = 'Row-' + r + ' Column-' + c
    }
  }
  div.appendChild(element)
}
