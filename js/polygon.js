prototypeFabric.polygon = {
    drawPolygon: function () {
        polygonMode = true;
        pointArray = [];
        lineArray = [];
        activeLine = {};
    },
    addPoint: function (options) {
        let random = Math.floor(Math.random() * (max - min + 1)) + min;
        let id = new Date().getTime() + random;
        let layerX, layerY; // Mouse position relative to closest positioned ancestor element.
        layerX = options.e.layerX;
        layerY = options.e.layerY;
        let circle = new fabric.Circle({
            radius: 5,
            fill: '#ffffff',
            stroke: '#333333',
            strokeWidth: 0.5,
            left: (layerX / canvas.getZoom()),
            top: (layerY / canvas.getZoom()),
            selectable: false,
            hasBorders: false,
            hasControls: false,
            originX: 'center',
            originY: 'center',
            id: id
        });

        if (pointArray.length === 0) {
            circle.set({
                fill: 'red'
            })
        }

        let points = [(layerX / canvas.getZoom()), (layerY / canvas.getZoom()), (layerX / canvas.getZoom()), (layerY / canvas.getZoom())];
        let line = new fabric.Line(points, {
            strokeWidth: 2,
            fill: '#999999',
            stroke: '#999999',
            class: 'line',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
        });

        if (activeShape) {
            let pos = canvas.getPointer(options.e);
            let points = activeShape.get("points");
            points.push({
                x: pos.x,
                y: pos.y
            });

            let polygon = new fabric.Polygon(points, {
                stroke: '#333333',
                strokeWidth: 1,
                fill: '#cccccc',
                opacity: 0.1,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false
            });

            canvas.remove(activeShape);
            canvas.add(polygon);
            activeShape = polygon;
            canvas.renderAll();
        } else {
            let polyPoint = [{ x: (layerX / canvas.getZoom()), y: (layerY / canvas.getZoom()) }];
            let polygon = new fabric.Polygon(polyPoint, {
                stroke: '#333333',
                strokeWidth: 1,
                fill: '#cccccc',
                opacity: 0.1,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false
            });
            activeShape = polygon;
            canvas.add(polygon);
        }
        activeLine = line;

        pointArray.push(circle);
        lineArray.push(line);

        canvas.add(line);
        canvas.add(circle);
        canvas.selection = false;
    },
    generatePolygon: function (pointArray) {
        let points = [];
        $.each(pointArray, function (index, point) {
            points.push({
                x: point.left,
                y: point.top
            });
            canvas.remove(point);
        });

        $.each(lineArray, function (index, line) {
            canvas.remove(line);
        });

        canvas.remove(activeShape).remove(activeLine);
        let polygon = new fabric.Polygon(points, {
            stroke: '#333333',
            strokeWidth: 0.5,
            fill: 'red',
            opacity: 1,
            hasBorders: false,
            hasControls: false
        });
        canvas.add(polygon);

        activeLine = null;
        activeShape = null;
        polygonMode = false;
        canvas.selection = true;
    }
};
