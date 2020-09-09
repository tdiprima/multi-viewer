let demo = function () {

}

demo.execute = function (num_divs, prod, options) {

    if (!options) {
        // default
        options = {
            filterOn: true,
            slidersOn: true,
            toolbarOn: true,
            multipleOn: true,
            paintbrushColor: "#0ff",
            viewerOpts: {
                showFullPageControl: false,
                showHomeControl: true,
                showZoomControl: false
            }
        }

        // default if single viewer
        if (num_divs === 1) {
            options = {
                filterOn: true,
                slidersOn: true,
                toolbarOn: false,
                multipleOn: false,
                paintbrushColor: "#0ff"
            }
        }
    }

    new pageSetup().setup(num_divs, options, prod)

}
