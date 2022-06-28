/**
 * Allow user to draw a polygon on the image.
 *
 * @param {object} viewerInfo - Info specific to 'this' viewer
 * @param {object} viewer - OSD viewer object
 * @param {object} overlay - Canvas on which to draw the polygon
 */
const drawPolygon = (viewerInfo, viewer, overlay) => {
  let idx = viewerInfo.idx;
  let btnDraw = document.getElementById(`btnDraw${idx}`);
  let mark = document.getElementById(`mark${idx}`);
  let canvas = overlay.fabricCanvas();
  let tag;

  let paintBrush = canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  paintBrush.decimate = 12;
  paintBrush.color = mark.innerHTML;

  canvas.on('mouse:over', evt => {
    if (evt.target !== null) {
      fillPolygon(evt, canvas, true);
    }
  });

  canvas.on('mouse:out', evt => {
    if (evt.target !== null) {
      fillPolygon(evt, canvas, false);
    }
  });

  canvas.on('mouse:up', (evt) => {
    annotate(evt);
    drawingOff(canvas, viewer);
  });

  canvas.on('path:created', opts => {
    pathCreatedHandler(opts, btnDraw, canvas, paintBrush, viewer);
  });

  btnDraw.addEventListener('click', function () {
    toggleButton(this, 'btnOn', 'annotationBtn');
    if (canvas.isDrawingMode) {
      // Drawing off
      drawingOff(canvas, viewer);
    } else {
      // Drawing on
      canvas.isDrawingMode = true;
      canvas.on('mouse:down', () => {
        setGestureSettings(canvas, viewer);
      });
      paintBrush.color = mark.innerHTML;
      paintBrush.width = 10 / viewer.viewport.getZoom(true);
      setOsdTracking(viewer, false);
    }
  });

  function annotate(evt) {
    // console.log("event", evt);
    if (canvas.isDrawingMode) {
      tag = createId2();
      // let pointer = evt.absolutePointer;
      let target = evt.currentTarget;
      let text = new fabric.Textbox('Annotate...', {
        width: 250,
        cursorColor: 'blue',
        // top: pointer.y,
        // left: pointer.x,
        top: target.top + target.height + 10,
        left: target.left + target.width + 10,
        fontSize: 20,
        editable: true,
        tag: tag
      });
      canvas.add(text);
      // console.log("text", text);
    }
  }

  function drawingOff(canvas, viewer) {
    canvas.isDrawingMode = false;
    canvas.off('mouse:down', () => {
      setGestureSettings(canvas, viewer);
    });
    setOsdTracking(viewer, true);
  }

  function pathCreatedHandler(options, button, canvas, paintBrush, viewer) {
    convertPathToPolygon(options.path, canvas, paintBrush);
    setupDeleteButton(options.path);
    toggleButton(button, 'annotationBtn', 'btnOn');
    canvas.off('path:created', () => {
      pathCreatedHandler(options, button, canvas, paintBrush, viewer);
    });
  }

  function setGestureSettings(canvas, viewer) {
    viewer.gestureSettingsMouse.clickToZoom = !canvas.getActiveObject();
  }

  function setupDeleteButton(obj) {
    obj.lockMovementX = true;
    obj.lockMovementY = true;
    let deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    let deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    function renderIcon(icon) {
      return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        let size = this.cornerSize;
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
      let target = transform.target;
      try {
        let canvas = target.canvas;
        canvas.remove(target);
        canvas.requestRenderAll();
      } catch (e) {
        console.error(`%c${e.message}`, 'font-size: larger;');
      }
    }
  }

  function convertPathToPolygon(pathObject, canvas, paintBrush) {
    let _points0 = pathObject.path.map(item => ({
      x: item[1],
      y: item[2]
    }));

    let poly = new fabric.Polygon(_points0, {
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
      cornerStyle: 'square',
      tag: tag
    });
    canvas.add(poly);
    poly.setControlVisible('tr', false);
    canvas.setActiveObject(poly);
    canvas.remove(pathObject);
  }

  function fillPolygon(pointerEvent, canvas, fill) {
    let obj = pointerEvent.target;

    if (isRealValue(obj) && obj.type === 'polygon') {
      // polygon hover
      if (fill) {
        obj.set({
          fill: obj.stroke,
          opacity: 0.5
        });
        // displayInfo(obj, canvas);
      } else {
        obj.set({
          fill: ''
        });
        // canvas.remove(infoText);
      }
      canvas.renderAll();
    }
  }

  // function displayInfo(obj, canvas) {
  //   // Display some kind of information. TBA.
  //   // Right now this displays what type of object it is. (Polygon, obviously.)
  //   let type = obj.type;
  //   let left = obj.left;
  //   let top = obj.top;
  //
  //   let infoText = new fabric.Text(type, {
  //     fontSize: 18,
  //     fontFamily: 'Courier',
  //     backgroundColor: 'rgba(102, 102, 102, 0.7)',
  //     stroke: 'rgba(255, 255, 255, 1)',
  //     fill: 'rgba(255, 255, 255, 1)',
  //     left, // pointer.x,
  //     top, // pointer.y
  //   });
  //   canvas.add(infoText);
  // }
};
