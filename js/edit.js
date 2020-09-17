cornerColor = 'rgba(0, 0, 255, 0.5)'; // default color for handles
pathToPoly = function (fabPath, canvas, paintBrush) {
    // console.log('pathToPoly');

    const c = paintBrush.color.toLowerCase()
    if (c.endsWith('ff') && c !== '#00ffff' && c !== '#ff00ff') {
        // blue corners with blue paint won't show up
        this.cornerColor = 'rgba(255, 255, 0, 0.5)';
    } else {
        this.cornerColor = 'rgba(0, 0, 255, 0.5)';
    }

    const _points0 = fabPath.path.map(item => ({
        x: item[1],
        y: item[2]
    }));

    // THERE ARE WAY TOO MANY POINTS; REDUCE THEM:
    let points = _points0.reduce(
        function (accumulator, currentValue, currentIndex) {
            if (currentIndex % 7 === 0)
                accumulator.push(currentValue);
            return accumulator;
        }, []);

    // CREATE NEW OBJECT
    let poly = new fabric.Polygon(points, {
        left: fabPath.left,
        top: fabPath.top,
        fill: "",
        strokeWidth: paintBrush.width,
        stroke: paintBrush.color,
        scaleX: fabPath.scaleX,
        scaleY: fabPath.scaleY,
        objectCaching: false,
        transparentCorners: false,
        cornerColor: this.cornerColor
    });
    canvas.add(poly);
    canvas.setActiveObject(poly);
    canvas.remove(fabPath);
}

// CONTROL HANDLING FUNCTIONS

// Locate the controls.
function polygonPositionHandler(dim, finalMatrix, fabricObject) {
    // Do for all points
    let x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
        y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
    return fabric.util.transformPoint(
        { x: x, y: y },
        fabric.util.multiplyTransformMatrices(
            fabricObject.canvas.viewportTransform,
            fabricObject.calcTransformMatrix()
        )
    );
}

// This function will be called on every mouse move after a control has been
// clicked and is being dragged.
function actionHandler(eventData, transform, x, y) {
    // polygon.__corner is the handle that you dragged.
    let polygon = transform.target,
        currentControl = polygon.controls[polygon.__corner],
        mouseLocalPosition = polygon.toLocalPoint(
            new fabric.Point(x, y),
            "center",
            "center"
        ),
        polygonBaseSize = polygon._getNonTransformedDimensions(),
        size = polygon._getTransformedDimensions(0, 0),
        finalPointPosition = {
            x:
                (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
                polygon.pathOffset.x,
            y:
                (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
                polygon.pathOffset.y
        };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
}

// Keep the polygon in the same position when we change its
// width/height/top/left.
function anchorWrapper(anchorIndex, fn) {
    // Once per button click when edit = yes.
    return function (eventData, transform, x, y) {
        let fabricObject = transform.target,
            absolutePoint = fabric.util.transformPoint(
                {
                    x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
                    y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
                },
                fabricObject.calcTransformMatrix()
            ),
            actionPerformed = fn(eventData, transform, x, y),
            newDim = fabricObject._setPositionDimensions({}),
            polygonBaseSize = fabricObject._getNonTransformedDimensions(),
            newX =
                (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
                polygonBaseSize.x,
            newY =
                (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
                polygonBaseSize.y;
        fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
        return actionPerformed;
    };
}

function getPolygon(canvas) {
    if (canvas.getActiveObject()) {
        // If one is selected, that's the one they wanna work on.
        return canvas.getActiveObject();
    } else {
        let x = canvas.getObjects('polygon');
        if (x.length === 0) {
            // No polygons
            return 'null';
        } if (x.length === 1) {
            // Return the first one
            return x[0];
        } else {
            // Tell me which one you want
            return 'null';
        }
    }
}

function Edit(canvas) {

    let poly = getPolygon(canvas);

    if (isRealValue(poly)) {
        // console.log("instance of Polygon:", poly instanceof fabric.Polygon);
        canvas.setActiveObject(poly);
        poly.edit = !poly.edit;
        if (poly.edit) {
            let lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = cornerColor;

            // accumulator, next item, index
            let reduceFun = function (acc, point, index) {
                // Create a control object for each polygon point
                acc['p' + index] = new fabric.Control({
                    positionHandler: polygonPositionHandler,
                    actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                    actionName: 'modifyPolygon',
                    pointIndex: index
                });
                return acc;
            }

            // Create a control buddy [hashtable]. Point p0 = corresponding Control object.
            // function, initial value
            poly.controls = poly.points.reduce(reduceFun, {});

        } else {
            poly.cornerColor = cornerColor;
            poly.cornerStyle = 'rect';
            // Default controls:
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
    } else {
        alert('Please select a polygon for editing.');
    }
}
