fb = new function () {
    let o, c;

    this.create = function (v) {
        o = v.fabricjsOverlay({
            scale: 1000
        });
        c = o.fabricCanvas();
        return {
            o: o,
            c: c
        }
    }

    this.clear = function (c, arr) {

        Object.keys(c.__eventListeners).forEach((prop) => {
            for (let i = 0; i < arr.length; i++) {
                if (prop === arr[i]) {
                    delete c.__eventListeners[prop];
                }
            }
        });
    }

}
