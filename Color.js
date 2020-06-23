function Color(elem) {
    var HEX = CP.HEX; // Old hex color parser

    CP.HEX = function (x) {
        x = HEX(x);
        if ('string' === typeof x) {
            var count = x.length;
            if (9 === count && x[1] === x[2] && x[3] === x[4] && x[5] === x[6] && x[7] === x[8]) {
                // Shorten!
                return x[0] + x[1] + x[3] + x[5] + x[7];
            }
            if (7 === count && x[1] === x[2] && x[3] === x[4] && x[5] === x[6]) {
                // Shorten!
                return x[0] + x[1] + x[3] + x[5];
            }
        }
        return x;
    };

    var picker = new CP(elem);

    // Disable the default blur and focus behavior
    picker.on('blur', function() {});
    picker.on('focus', function() {});

    picker.on('change', function (r, g, b, a) {
        this.source.value = this.color(r, g, b, a);
        this.source.style.backgroundColor = this.color(r, g, b, a);
    });

    picker.source.addEventListener('click', function(e) {
        picker.enter();
        e.stopPropagation();
    }, false);

    document.documentElement.addEventListener('click', function() {
        picker.exit();
    }, false);
    
}