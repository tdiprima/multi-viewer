function createDraggableDiv(id, title, left, top, viz) {
  let myDiv = document.createElement('div')
  myDiv.id = id
  myDiv.className = 'popup'
  myDiv.style.left = left + 'px'
  myDiv.style.top = top + 'px'

  let myImg = document.createElement('img')
  myImg.src = '/multi-viewer/images/close-icon.png'

  myImg.width = 25
  myImg.height = 25
  myImg.alt = 'close'
  myImg.style.cursor = 'pointer'
  myImg.addEventListener('click', function () {
    myDiv.style.display = 'none'
  })

  let myHeader = document.createElement('div')
  myHeader.id = id + 'Header' // Note the naming convention
  myHeader.className = 'popupHeader'
  myHeader.appendChild(myImg)
  myHeader.appendChild(document.createTextNode(title))
  myDiv.appendChild(myHeader)

  let body = document.createElement('div')
  body.id = id + 'Body' // Note the naming convention
  // "body" to be filled in by calling function
  myDiv.appendChild(body)
  document.body.appendChild(myDiv)
  if (!viz) {
    myDiv.style.display = 'none' // This gets toggled
  }

  // Make the DIV element draggable
  dragElement(myDiv)

  return myDiv
}

function dragElement(_elem) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0
  // Note the naming convention
  if (document.getElementById(_elem.id + 'Header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(_elem.id + 'Header').onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    _elem.onmousedown = dragMouseDown
  }

  // Mouse-down handler
  function dragMouseDown(e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
  }

  // Mouse-move handler
  function elementDrag(e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    _elem.style.top = (_elem.offsetTop - pos2) + 'px'
    _elem.style.left = (_elem.offsetLeft - pos1) + 'px'
  }

  // Mouse-up handler
  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
  }
}
