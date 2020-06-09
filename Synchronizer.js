function Synchronizer(viewerArray) {

  let syncedViews = [];
  let activeViewer = null;

  viewerArray.forEach(function (elem) {
    // console.log(elem);
    let currentViewer = elem.getViewer();
    let id = currentViewer.id;

    currentViewer.addHandler('pan', handler);
    currentViewer.addHandler('zoom', handler);

    function handler() {

      if (activeViewer == null) {
        activeViewer = id; // init
      }

      if (activeViewer !== id) {
        return; // somebody else leading
      }

      syncedViews.forEach(function (view) {
        if (view.id === id) {
          return
        }
        view.viewport.zoomTo(currentViewer.viewport.getZoom());
        view.viewport.panTo(currentViewer.viewport.getCenter());

      });
      activeViewer = null;

    }

    syncedViews.push(currentViewer);
  })

}