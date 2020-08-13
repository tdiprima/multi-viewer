/**
 * Define a function that can locate the controls.
 * This function will be used both for drawing and for interaction.
 */
function polygonPositionHandler(dim, finalMatrix, fabricObject) {

    let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x);
    let y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);

    // matrix = fabric.util.multiplyTransformMatrices(matrix, matrix)
    let matrix = fabric.util.multiplyTransformMatrices(
        fabricObject.canvas.viewportTransform,
        fabricObject.calcTransformMatrix()
    );

    let point = { x: x, y: y };
    let retPoint = fabric.util.transformPoint(point, matrix);

    //console.log("point, retPoint:" + point + ", " + retPoint);

    return retPoint;
}

/**
 * Define a function that will define what the control does.
 * This function will be called on every mouse move after a control has been
 * clicked and is being dragged.
 * The function receive as argument the mouse event, the current transform object
 * and the current position in canvas coordinate.
 * transform.target is a reference to the current object being transformed.
 */
function actionHandler(eventData, transform, x, y) {

    // TODO: Check here.
    let polygon = transform.target;
    let currentControl = polygon.controls[polygon.__corner];
    let mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center');
    let polygonBaseSize = polygon._getNonTransformedDimensions();
    let size = polygon._getTransformedDimensions(0, 0);

    let finalPointPosition = {
        x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
        y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
    };

    //console.log('finalPointPosition', finalPointPosition);

    polygon.points[currentControl.pointIndex] = finalPointPosition;

    return true;
}

/**
 * Define a function that can keep the polygon in the same position when we change its
 * width/height/top/left.
 */
function anchorWrapper(anchorIndex, fn) {

    return function (eventData, transform, x, y) {

        let fabricObject = transform.target;

        // "anchor point" absolute position
        // We choose to fix the polygon position on the actual position of any point of the points array
        // that is not the one that we are dragging.
        let absolutePoint = fabric.util.transformPoint({
            x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
            y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
        }, fabricObject.calcTransformMatrix());
        //console.log('absolutePoint', absolutePoint);

        let actionPerformed = fn(eventData, transform, x, y);
        let newDim = fabricObject._setPositionDimensions({});
        //console.log('newDim', newDim);
        let polygonBaseSize = fabricObject._getNonTransformedDimensions();

        // Point position with a range from -0.5 to 0.5 for X and Y
        let newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x;
        let newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;

        // Translate the old absolutePoint we find before
        fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);

        return actionPerformed;
    }
}

/**
 * Clone what are you copying since you
 * may want copy and paste on different moment.
 * and you do not want the changes happened
 * later to reflect on the copy.
 */
function Edit(canvas) {
    let objects = canvas.getObjects();
    console.log('objs', objects.length, objects);
    // let poly = objects[0]; // For now.
    let polygon = objects[0]; // Check for type polygon, allow selection, etc.

    if (objects.length === 0) {
        alert('Draw a polygon first!')
    } else {
        // Create a polygon object
        // let polygon = new fabric.Polygon(poly.points, {
        //   left: poly.left,
        //   top: poly.top,
        //   strokeWidth: poly.strokeWidth,
        //   stroke: 'green',
        //   scaleX: poly.scaleX,
        //   scaleY: poly.scaleY,
        //   objectCaching: false,
        //   transparentCorners: false,
        //   cornerColor: 'blue',
        // });

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

}
