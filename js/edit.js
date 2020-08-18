// Locate the controls.
// This function will be used both for drawing and for interaction.
function polygonPositionHandler(dim, finalMatrix, fabricObject) {
    // THIRD (for all points)
    let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
        y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
    return fabric.util.transformPoint(
        { x: x, y: y },
        fabric.util.multiplyTransformMatrices(
            fabricObject.canvas.viewportTransform,
            fabricObject.calcTransformMatrix()
        )
    );
}

// Define what the control does.
// This function will be called on every mouse move after a control has been
// clicked and is being dragged.
// The function receives as argument the mouse event, the current transform object
// and the current position in canvas coordinates.
// transform.target is a reference to the current object being transformed.
function actionHandler(eventData, transform, x, y) {
    // SECOND
    let polygon = transform.target,
        currentControl = polygon.controls[polygon.__corner],
        mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
        polygonBaseSize = polygon._getNonTransformedDimensions(),
        size = polygon._getTransformedDimensions(0, 0),
        finalPointPosition = {
            x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
            y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
        };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
}

// Keep the polygon in the same position when we change its
// width/height/top/left.
function anchorWrapper(anchorIndex, fn) {
    // FIRST
    return function (eventData, transform, x, y) {
        let fabricObject = transform.target,
            absolutePoint = fabric.util.transformPoint({
                x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
            }, fabricObject.calcTransformMatrix()),
            actionPerformed = fn(eventData, transform, x, y),
            newDim = fabricObject._setPositionDimensions({}),
            polygonBaseSize = fabricObject._getNonTransformedDimensions(),
            newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
            newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
        fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
        return actionPerformed;
    }
}

function getPolygon(canvas) {
    if (canvas.getActiveObject()) {
        return canvas.getActiveObject();
    } else {
        return canvas.getObjects()[0]; // TODO: check object(s)
    }
}

function Edit(canvas) {

    let polygon = getPolygon(canvas);
    // canvas.viewportTransform = [0.7, 0, 0, 0.7, -50, 50]; // ???
    canvas.setActiveObject(polygon);
    polygon.edit = !polygon.edit;
    if (polygon.edit) {
        let lastControl = polygon.points.length - 1;
        polygon.cornerStyle = 'circle';
        polygon.cornerColor = 'rgba(0,0,255,0.5)';
        polygon.controls = polygon.points.reduce(function (acc, point, index) {
            acc['p' + index] = new fabric.Control({
                positionHandler: polygonPositionHandler,
                actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                actionName: 'modifyPolygon',
                pointIndex: index
            });
            return acc;
        }, {});
    } else {
        polygon.cornerColor = 'blue';
        polygon.cornerStyle = 'rect';
        polygon.controls = fabric.Object.prototype.controls;
    }
    polygon.hasBorders = !polygon.edit;
    canvas.requestRenderAll();
}
