function createDraggableDiv(id, title) {
  let div = document.createElement('div')
  div.id = id

  // Include a header DIV with the same name as the draggable DIV, followed by "Header"
  let divHead = document.createElement('div')
  divHead.id = `${id}Header`
  div.appendChild(divHead)

  let img = document.createElement('img')
  img.src = 'images/close_icon.png'
  img.width = 25
  img.height = 25
  img.style.cssFloat = 'left'
  divHead.appendChild(img)


  // Ditto body
  let divBody = document.createElement('div')
  divBody.id = `${id}Body`
  div.appendChild(divHead)

  return div
}

// Make the DIV element draggable:
function dragElement(elmnt) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0
  if (document.getElementById(elmnt.id + 'Header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + 'Header').onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown
  }

  // Mousedown handler
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
    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
  }

  // Done handler
  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
  }
}
