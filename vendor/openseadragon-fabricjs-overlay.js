/**
 * OpenSeadragon canvas overlay plugin based on svg overlay plugin and fabric.js
 * @version 0.6.0
 */
(function () {
  if (!window.OpenSeadragon) {
    console.error('[openseadragon-canvas-overlay] requires OpenSeadragon')
    return
  }

  /**
   * Adds fabric.js overlay capability to your OpenSeadragon Viewer
   * @param {Object} options
   *     Allows configurable properties to be entirely specified by passing
   *     an options object to the constructor.
   * @param {Number} options.scale
   *     Fabric 'virtual' canvas size, for creating objects
   */
  OpenSeadragon.Viewer.prototype.fabricjsOverlay = function (options) {
    // Default
    this._fabricjsOverlayInfo = new Overlay(this)
    this._fabricjsOverlayInfo._scale = 1000

    // Set options
    if (options) {
      if (options.static) {
        this._fabricjsOverlayInfo = new Overlay(this, options.static)
      } else {
        this._fabricjsOverlayInfo = new Overlay(this, false)
      }

      if (options.scale) {
        this._fabricjsOverlayInfo._scale = options.scale // arbitrary scale for created fabric canvas
      } else {
        this._fabricjsOverlayInfo._scale = 1000
      }
    }

    return this._fabricjsOverlayInfo
  }

  // Static counter for multiple overlays differentiation
  const counter = (function () {
    let i = 1

    return function () {
      return i++
    }
  })()

  // ----------
  const Overlay = function (viewer, staticCanvas) {
    const self = this

    this._viewer = viewer

    this._containerWidth = 0
    this._containerHeight = 0

    this._canvasdiv = document.createElement('div')
    this._canvasdiv.style.position = 'absolute'
    this._canvasdiv.style.left = '0px'
    this._canvasdiv.style.top = '0px'
    this._canvasdiv.style.width = '100%'
    this._canvasdiv.style.height = '100%'
    this._viewer.canvas.appendChild(this._canvasdiv)

    this._canvas = document.createElement('canvas')

    this._id = 'osd-overlaycanvas-' + counter()
    this._canvas.setAttribute('id', this._id)
    this._canvasdiv.appendChild(this._canvas)
    this.resize()

    // Make the canvas static if specified, ordinary otherwise
    if (staticCanvas) {
      this._fabricCanvas = new fabric.StaticCanvas(this._canvas)
    } else {
      this._fabricCanvas = new fabric.Canvas(this._canvas)
    }

    // Disable fabric selection because default click is tracked by OSD
    this._fabricCanvas.selection = false

    // Prevent OSD click elements on fabric objects
    this._fabricCanvas.on('mouse:down', function (options) {
      if (options.target) {
        options.e.preventDefaultAction = true
        options.e.preventDefault()
        options.e.stopPropagation()
      }
    })

    this._fabricCanvas.on('mouse:up', function (options) {
      if (options.target) {
        options.e.preventDefaultAction = true
        options.e.preventDefault()
        options.e.stopPropagation()
      }
    })

    // Resize the fabric.js overlay
    this._viewer.addHandler('update-viewport', function () {
      // called on 'open', when the viewer or window changes size, ...
      self.resize()
      self.resizeCanvas()
      self.render()
    })

    this._viewer.addHandler('open', function () {
      self.resize()
      self.resizeCanvas()
      self.render()
    })

    window.addEventListener('resize', function () {
      self.resize()
      self.resizeCanvas()
      self.render()
    })
  }

  // ----------
  Overlay.prototype = {
    // ----------
    canvas: function () {
      return this._canvas
    },
    fabricCanvas: function () {
      // Returns fabric.js canvas that you can add elements to
      return this._fabricCanvas
    },
    // ----------
    clear: function () {
      this._fabricCanvas.clear()
    },
    render: function () {
      this._fabricCanvas.renderAll()
    },
    // ----------
    resize: function () {
      // Resize OSD container
      if (this._containerWidth !== this._viewer.container.clientWidth) {
        this._containerWidth = this._viewer.container.clientWidth
        this._canvasdiv.setAttribute('width', this._containerWidth)
        this._canvas.setAttribute('width', this._containerWidth)
      }
      if (this._containerHeight !== this._viewer.container.clientHeight) {
        this._containerHeight = this._viewer.container.clientHeight
        this._canvasdiv.setAttribute('height', this._containerHeight)
        this._canvas.setAttribute('height', this._containerHeight)
      }
    },
    resizeCanvas: function () {
      // Resize overlay canvas
      const origin = new OpenSeadragon.Point(0, 0)
      const viewportZoom = this._viewer.viewport.getZoom(true)
      this._fabricCanvas.setWidth(this._containerWidth)
      this._fabricCanvas.setHeight(this._containerHeight)
      // let zoom = this._viewer.viewport._containerInnerSize.x * viewportZoom / this._scale;
      // this._fabricCanvas.setZoom(zoom);
      this._fabricCanvas.setZoom(viewportZoom)
      const viewportWindowPoint = this._viewer.viewport.viewportToWindowCoordinates(origin)
      const x = Math.round(viewportWindowPoint.x)
      const y = Math.round(viewportWindowPoint.y)
      const canvasOffset = this._canvasdiv.getBoundingClientRect()
      const pageScroll = OpenSeadragon.getPageScroll()
      this._fabricCanvas.absolutePan(new fabric.Point(canvasOffset.left - x + pageScroll.x, canvasOffset.top - y + pageScroll.y))
    }
  }
})()
