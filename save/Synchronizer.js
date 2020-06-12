class Synchronizer {
  constructor(viewerArray) {
    let syncedViewers = []; // array of synchronized viewers
    let activeViewerId = null; // magic init

    // Loop through array of n-viewers
    viewerArray.forEach(function (elem) {
      // Created viewer already.
      let currentViewer = elem.getViewer();

      // Add handlers
      currentViewer.addHandler('pan', handler);
      currentViewer.addHandler('zoom', handler);

      function handler() {
        // My viewer is clicked, I'm the active viewer
        // start magic
        if (activeViewerId == null) {
          activeViewerId = currentViewer.id;
        }
        if (activeViewerId !== currentViewer.id) {
          return;
        }
        // end magic

        // As for everybody else...
        syncedViewers.forEach(function (item) {
          let view = item.getViewer()
          if (view.id === currentViewer.id) {
            return;
          }
          /*
            // other viewers' coords set to my coordinates
            // unless they are locked
            if (!item.getLocked()) {
              view.viewport.zoomTo(currentViewer.viewport.getZoom());
              view.viewport.panTo(currentViewer.viewport.getCenter());
            }
           */
          // Lock zoom position, keep pan
          if (item.getLocked()) {
            view.viewport.panTo(currentViewer.viewport.getCenter());
          }
          else {
            view.viewport.zoomTo(currentViewer.viewport.getZoom());
            view.viewport.panTo(currentViewer.viewport.getCenter());
          }
        });
        // magic support
        activeViewerId = null;
      }
      syncedViewers.push(elem);  // add our [viewer] to our list
    });

  }
}
