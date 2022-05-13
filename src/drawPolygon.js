/**
 * Allow user to draw a polygon on the image.
 * @param viewerInfo
 * @param viewer: OSD viewer object
 * @param overlay: fabric overlay object
 */
const drawPolygon = (viewerInfo, viewer, overlay) => {
  const idx = viewerInfo.idx;
  const btnDraw = document.getElementById(`btnDraw${idx}`);
  const mark = document.getElementById(`mark${idx}`);
  const canvas = this.__canvas = overlay.fabricCanvas();
  const paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  paintBrush.decimate = 20; // TODO: 10, maybe.
  paintBrush.color = mark.innerHTML;

  canvas.on('mouse:over', evt => {
    fillPolygon(evt, canvas);
  });
  canvas.on('mouse:out', evt => {
    unfillPolygon(evt, canvas);
  });
  canvas.on('mouse:up', () => {
    turnDrawingOff(canvas, viewer);
  });
  canvas.on('path:created', opts => {
    pathCreatedHandler(opts, btnDraw, canvas, paintBrush, viewer);
  });

  btnDraw.addEventListener('click', function() {
    toggleButton(this, 'btnOn', 'annotationBtn');
    // Toggle drawing
    if (canvas.isDrawingMode) {
      turnDrawingOff(canvas, viewer);
    } else {
      turnDrawingOn(canvas, viewer, paintBrush, mark);
    }
  });

  function turnDrawingOff(canvas, viewer) {
    canvas.isDrawingMode = false;
    canvas.off('mouse:down', () => {
      setGestureSettings(canvas, viewer);
    });
    setOsdMove(viewer, true);
  }

  function turnDrawingOn(canvas, viewer, paintBrush, mark) {
    canvas.isDrawingMode = true;
    canvas.on('mouse:down', () => {
      setGestureSettings(canvas, viewer);
    });
    paintBrush.color = mark.innerHTML;
    paintBrush.width = 10 / viewer.viewport.getZoom(true);
    setOsdMove(viewer, false);
  }

  function pathCreatedHandler(options, button, canvas, paintBrush, viewer) {
    convertPathToPolygon(options.path, canvas, paintBrush);
    customizePolygonControls(options.path, canvas, viewer);
    toggleButton(button, 'annotationBtn', 'btnOn');
    canvas.off('path:created', () => {
      pathCreatedHandler(options, button, canvas, paintBrush, viewer);
    });
  }

  function setGestureSettings(canvas, viewer) {
    viewer.gestureSettingsMouse.clickToZoom = !canvas.getActiveObject();
  }

  function customizePolygonControls(obj, canvas, viewer) {
    obj.lockMovementX = true;
    obj.lockMovementY = true;
    setupDeleteButton(canvas, viewer);
  }

  function setupDeleteButton() {
    const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    const deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    function renderIcon(icon) {
      return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        const size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(icon, -size / 2, -size / 2, size, size);
        ctx.restore();
      };
    }

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 15,
      offsetY: -15,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon(deleteImg),
      cornerSize: 24
    });

    function deleteObject(mouseEvent, transform) {
      const target = transform.target;
      try {
        const canvas = target.canvas;
        canvas.remove(target);
        canvas.requestRenderAll();
      } catch (e) {
        console.error(`%c${e.message}`, 'font-size: larger;');
      }
    }
  }

  function convertPathToPolygon(pathObject, canvas, paintBrush) {
    const _points0 = pathObject.path.map(item => ({
      x: item[1],
      y: item[2]
    }));

    const poly = new fabric.Polygon(_points0, {
      left: pathObject.left,
      top: pathObject.top,
      fill: '',
      strokeWidth: paintBrush.width,
      stroke: paintBrush.color,
      scaleX: pathObject.scaleX,
      scaleY: pathObject.scaleY,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: 'rgba(0, 0, 255, 0.5)',
      cornerStyle: 'square'
    });
    canvas.add(poly);
    poly.setControlVisible('tr', false);
    canvas.setActiveObject(poly);
    canvas.remove(pathObject);
  }

  function fillPolygon(pointerEvent, canvas) {
    if (weHoveredOverPolygon(pointerEvent)) {
      const obj = pointerEvent.target;
      obj.set({
        fill: obj.stroke,
        opacity: 0.5
      });
      // displayInfo()
      canvas.renderAll();
    }
  }

  function unfillPolygon(pointerEvent, canvas) {
    if (weHoveredOverPolygon(pointerEvent)) {
      const obj = pointerEvent.target;
      if (obj !== null) {
        obj.set({
          fill: ''
        });
        // canvas.remove(infoText)
        canvas.renderAll();
      }
    }
  }

  function weHoveredOverPolygon(pointerEvent) {
    return isRealValue(pointerEvent.target) && pointerEvent.target.type === 'polygon';
  }

  // function displayInfo (obj, canvas) {
  //   // Display some kind of information. TBA.
  //   // Right now this displays what type of object it is. (Polygon, obviously.)
  //   const type = obj.type
  //   const left = obj.left
  //   const top = obj.top
  //
  //   const infoText = new fabric.Text(type, {
  //     fontSize: 18,
  //     fontFamily: 'Courier',
  //     backgroundColor: 'rgba(102, 102, 102, 0.7)',
  //     stroke: 'rgba(255, 255, 255, 1)',
  //     fill: 'rgba(255, 255, 255, 1)',
  //     left: left, // pointer.x,
  //     top: top // pointer.y
  //   })
  //   canvas.add(infoText)
  // }
};
