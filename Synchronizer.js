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

          let p = item.getChkPan();
          let z = item.getChkZoom();
          // let c = item.getChkCenter();

          // other viewers' coords set to my coordinates
          // EXCEPT...

          // if (!item.getLocked()) {
          if (p) {
            // If I say to do the pan, then do the pan.
            view.viewport.panTo(currentViewer.viewport.getCenter());
          }
          if (z) {
            // If I say zoom, then do zoom.
            view.viewport.zoomTo(currentViewer.viewport.getZoom());
          }
          // if (c) {
          //   // If center, Then... ??
          //   view.viewport.panTo(currentViewer.viewport.getCenter())
          // }
          // }

        });
        // magic support
        activeViewerId = null;
      }
      syncedViewers.push(elem);  // add our [viewer] to our list
    });
  }
}
