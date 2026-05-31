# multi-viewer

Multiple synchronized OpenSeadragon viewers for comparing whole-slide images with layered overlays, annotation tools, and real-time pan/zoom sync.

## The Challenge of Side-by-Side Pathology Review

Comparing whole-slide images — across stains, timepoints, or model outputs — is painful when each viewer behaves independently. Zooming into a region of interest in one pane means manually re-navigating every other pane. Layer management is either absent or buried. Annotation tools require separate software. Researchers and pathologists end up splitting attention across multiple applications with no coherent workflow.

## What multi-viewer Does

multi-viewer renders any number of OpenSeadragon viewers in a configurable grid layout and keeps them locked in sync. Pan or zoom in one pane and all others follow instantly. Each viewer supports multiple image layers — segmentation masks, heatmaps, base scans — with per-layer controls rendered in a sidebar: visibility toggle, opacity slider, color palette, drag-to-reorder, and visualization mode selector.

A Fabric.js overlay sits on top of each viewer and powers interactive annotation: freehand polygon drawing, polygon editing, a calibrated ruler that measures in microns using image resolution metadata, and a grid overlay for structured review. Viewers can be independently opted out of sync via per-pane pan and zoom checkboxes, and the current viewport state (zoom level, x/y coordinates) can be shared as a bookmarkable URL. Snapshots of any pane can be downloaded as timestamped PNG files.

## Concrete Example

```js
// Two viewers side-by-side, synced
pageSetup(
  'viewerContainer',
  [
    [{ location: 'https://example.com/slide1.tiff', opacity: 1 }],
    [{ location: 'https://example.com/slide2.tiff', opacity: 1 }]
  ],
  2,    // numViewers
  1,    // rows
  2,    // columns
  800,  // width (px)
  600,  // height (px)
  { toolbarOn: true }
);

// Synchronize pan & zoom across all viewers
synchronizeViewers(viewers);
```

Each image array entry is a viewer; each item within it is a layer. Layers are loaded as OpenSeadragon tile sources and rendered in order.

## Usage

**Install dependencies and build:**

```sh
npm install
grunt
```

**Generate API docs:**

```sh
npm run doc
```

**Run the linter:**

```sh
npm run lint
```

Open any HTML file in the `docs/` directory to explore the API reference, or wire up `pageSetup` in your own HTML with a target `<div>` and your tile source URLs.

**Built with:** OpenSeadragon, Fabric.js, Grunt, Babel, ESLint, ES6, HTML5, CSS3

## Dependencies

[color-picker](https://github.com/taufik-nurrohman/color-picker/releases/tag/v2.2.4)

[fabric.js](https://github.com/fabricjs/fabric.js/releases/tag/v521)

<!--[Font Awesome](https://use.fontawesome.com/releases/v5.15.3/fontawesome-free-5.15.3-web.zip)-->

[Font Awesome](https://use.fontawesome.com/releases/v6.5.1/fontawesome-free-6.5.1-web.zip)

[jQuery](https://github.com/jquery/jquery/archive/refs/tags/3.5.1.tar.gz)


[OpenSeadragon](https://github.com/openseadragon/openseadragon/releases/tag/v2.4.2)

[OpenseadragonFabricjsOverlay](https://github.com/tdiprima/OpenseadragonFabricjsOverlay)

[OpenSeadragonFiltering](https://github.com/usnistgov/OpenSeadragonFiltering)

[OpenSeadragonScalebar
](https://github.com/usnistgov/OpenSeadragonScalebar)

<br>
