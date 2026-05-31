import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Third-party libraries loaded via script tags
        OpenSeadragon: "readonly",
        fabric: "readonly",
        // Project globals shared across concatenated source files
        alertMessage: "readonly",
        blender: "readonly",
        colorToArray: "readonly",
        CONFIG: "readonly",
        CP: "readonly",
        createDraggableDiv: "readonly",
        createId: "readonly",
        createId2: "readonly",
        drawPolygon: "readonly",
        editPolygon: "readonly",
        filterPopup: "readonly",
        getRandomInt: "readonly",
        getVals: "readonly",
        gridOverlay: "readonly",
        ImageViewer: "writable",
        isEmpty: "readonly",
        isRealValue: "readonly",
        layerPopup: "readonly",
        layerUI: "readonly",
        mapMarker: "readonly",
        markupTools: "readonly",
        MAX: "readonly",
        MICRONS_PER_PIX: "readonly",
        RENDER_TYPES: "readonly",
        ruler: "readonly",
        saveSettings: "readonly",
        setFilter: "readonly",
        setOsdTracking: "readonly",
        SYNCED_IMAGE_VIEWERS: "writable",
        synchronizeViewers: "readonly",
        toggleButton: "readonly",
      },
    },
    rules: {
      "no-console": "error",
      "no-alert": "error",
      "max-len": ["error", 100, 2, { ignoreUrls: true }],
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "docs/",
      "vendor/",
      "three.js/",
      "testing/",
      "Gruntfile.js",
    ],
  },
];
