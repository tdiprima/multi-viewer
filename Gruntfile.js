module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %> */',
    concat_in_order: {
      options: {
        banner: '<%= banner %>\n',
        stripBanners: true,
        separator: ';'
      },
      basic: {
        src: ['src/commonFunctions.js',
          'src/pageSetup.js',
          'src/editPolygon.js',
          'src/drawPolygon.js',
          // 'src/mugshots.js',
          'src/gridOverlay.js',
          'src/mapMarker.js',
          'src/ruler.js',
          'src/blender.js',
          'src/markupTools.js',
          'src/draggable.js',
          'src/filterPopup.js',
          'src/filters.js',
          'src/ImageViewer.js',
          'src/layerUI.js',
          'src/layerPopup.js',
          'src/MultiViewer.js',
          'src/synchronizeViewers.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      extras: {
        src: ['vendor/openseadragon/openseadragon.min.js',
          'vendor/openseadragon-fabricjs-overlay.js',
          'vendor/jquery-3.5.1.min.js',
          // Dependency required in vendor/fabric-5.2.1.js does not exist: jsdom
          // Dependency required in vendor/openseadragon-filtering.js does not exist: openseadragon
          'vendor/openseadragon-scalebar.js',
          'vendor/color-picker-2.2.4.js'],
        dest: 'dist/vendor.min.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      target: {
        files: {
          'dist/main.min.css': ['css/*.css']
          // vendor/fontawesome needs to stay put
        }
      }
    }
  })

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('grunt-concat-in-order')
  grunt.loadNpmTasks('grunt-contrib-uglify-es')
  grunt.loadNpmTasks('grunt-contrib-cssmin')

  // Default task(s).
  grunt.registerTask('default', ['concat_in_order', 'uglify', 'cssmin'])
}
