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

  // Remove div on click
  document.getElementById('closeDiv').addEventListener('click', function () {
    this.style.color = '#000'
    this.parentNode.parentNode.remove()
  })

  return div
}

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
