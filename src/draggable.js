function createDraggableDiv(id, title, left, top) {
  let htm = `<div id="${id}" class="popup" style="left: ${left}px; top: ${top}px;">
  <img id="closeDiv" src="images/close_icon.png" style="float: left;" width="25" height="25" alt="close">
  <div id="${id}Header" class="popupHeader">${title}</div>
  <div id="${id}Body"></div></div>`

  let div = document.createElement('div')
  div.innerHTML = htm
  document.body.appendChild(div)

  // Make the DIV element draggable
  dragElement(document.getElementById(`${id}`))

  // Setup "close" event listener
  document.getElementById('closeDiv').addEventListener('click', function () {
    this.style.color = '#000'
    this.parentNode.parentNode.remove()
  })

  return div
}

function dragElement(_elem) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0
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
