## Viewer Input Hook

**[Viewer Input Hook](https://github.com/msalsbery/OpenSeadragonViewerInputHook)**

### tracker.  handler.  hookHandler.
```
viewer.addViewerInputHook({hooks: [
        {tracker: 'viewer', handler: 'scrollHandler', hookHandler: onViewerScroll},
        {tracker: 'viewer', handler: 'clickHandler', hookHandler: onViewerClick}
    ]});
```

### MouseTracker Handlers:

```
'enterHandler'
'exitHandler'
'pressHandler'
'nonPrimaryPressHandler'
'releaseHandler'
'nonPrimaryReleaseHandler'
'moveHandler'
'stopHandler'
'scrollHandler'
'clickHandler'
'dblClickHandler'
'dragHandler'
'dragEndHandler'
'pinchHandler'
'keyDownHandler'
'keyUpHandler'
'keyHandler'
'focusHandler'
'blurHandler'
```