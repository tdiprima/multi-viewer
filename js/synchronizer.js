/**
 * Handles synchronization of the viewers
 */
class Synchronizer {
    constructor(viewerArray) {
        console.log('viewerArray', viewerArray);

        // let len = viewerArray.length;
        // viewerArray.forEach(element => element.modOptions(len));

        let syncedViewers = []; // array of synchronized viewers
        let activeViewerId = null; // magic init

        // Loop through array of n-viewers
        viewerArray.forEach(function (elem) {
            // Created viewer already.
            let currentViewer = elem.getViewer();

            // Add handlers
            currentViewer.addHandler('pan', handler);
            currentViewer.addHandler('zoom', handler);
            locationPin(currentViewer, syncedViewers);

            function handler(event) {
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

                    // other viewers' coords set to my coordinates
                    // EXCEPT...
                    if (item.getChkPan() && elem.getChkPan()) {
                        view.viewport.panTo(currentViewer.viewport.getCenter());
                    }
                    if (item.getChkZoom() && elem.getChkZoom()) {
                        view.viewport.zoomTo(currentViewer.viewport.getZoom());
                    }

                });
                // magic support
                activeViewerId = null;
            }

            syncedViewers.push(elem);  // add our [viewer] to our list
        });
    }
}
