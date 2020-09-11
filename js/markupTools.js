function markupTools(idx, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    // call this and that
    freeDrawing(idx, viewer, overlay);
    grid(idx, viewer, overlay);

}
