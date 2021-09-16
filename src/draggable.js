function createDraggableDiv(id, title, left, top, viz) {
  let myDiv = e('div', {id: id, class: 'popup'})
  myDiv.style.left = left + 'px'
  myDiv.style.top = top + 'px'

  // images/close-icon.png
  let myImg = e('img', {src: '/multi-viewer/images/close-icon.png', width: 25, height: 25, alt: 'close'})
  myImg.style.cursor = 'pointer'
  myImg.addEventListener('click', function () {
    myDiv.style.display = 'none'
  })

  const myHeader = e('div', {id: `${id}Header`, class: 'popupHeader'},
    [myImg, e('span', {}, [title])])
  myDiv.appendChild(myHeader)

  let body = e('div', {id: `${id}Body`})
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
