myOffsetFunction = function (param) {
    // Get offset
    const getOffsetTop = element => {
        let offsetTop = 0;
        let count = 1;
        while (element) {
            offsetTop += element.offsetTop;
            element = element.offsetParent;
            console.log('element ' + count + ": ", element);
            count++;
        }
        return offsetTop;
    }

    console.log(param);
    const someElement = document.getElementById(param);
    // 'viewer0', "openseadragon-canvas", "osd-overlaycanvas-1"

    let parentObj = someElement.offsetParent;
    console.log('parentObj', parentObj);

    const topp = getOffsetTop(someElement);
    console.log('top:', topp);

    // Some other implementation example
    const getOffset = (element, horizontal = false) => {
        if (!element) return 0;
        return getOffset(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop);
    }

    // calling
    const X = getOffset(someElement);
    const Y = getOffset(someElement, true);
    console.log("x, y:", X, Y);

}