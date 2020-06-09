class Synchronizer {
  constructor(viewerArray) {
    let syncedViewers = [];
    let activeViewerId = null;

    // Loop through array of n-viewers
    viewerArray.forEach(function (elem) {
      let currentNv = elem;
      // let locked = currentNv.getLocked()
      let currentViewer = currentNv.getViewer();
      let id = currentViewer.id;

      currentViewer.addHandler('pan', handler);
      currentViewer.addHandler('zoom', handler);

      function handler() {
        // My viewer is clicked, I'm the active viewer
        if (activeViewerId == null) {
          activeViewerId = id;
        }
        if (activeViewerId !== id) {
          return;
        }

        // As for everybody else...
        syncedViewers.forEach(function (item) {
          let view = item.getViewer()
          if (view.id === id) {
            return;
          }

          // other viewers' coords set to my coordinates
          // unless they are locked
          if (!item.getLocked()) {
            view.viewport.zoomTo(currentViewer.viewport.getZoom());
            view.viewport.panTo(currentViewer.viewport.getCenter());
          }

        });
        activeViewerId = null;
      }
      syncedViewers.push(currentNv);
    });

    this.setLocked = function (idx, bool) {
      syncedViewers[idx].setLocked(bool);
      syncedViewers.forEach(function (item) {
        console.log(item.getViewer().id, item.getLocked())
      });
    }

    this.getLocked = function (idx) {
      return syncedViewers[idx].getViewer().getLocked();
    }

  }
}
