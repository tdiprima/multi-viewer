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
          'src/filters.js',
          'src/ImageViewer.js',
          'src/layers.js',
          'src/MultiViewer.js',
          'src/synchronizeViewers.js'],
        dest: 'build/<%= pkg.name %>.js'
      },
      extras: {
        src: ['vendor/openseadragon/openseadragon.min.js',
          'vendor/openseadragon-fabricjs-overlay.js',
          'vendor/jquery-3.5.1.min.js',
          'vendor/color-picker.min.js'],
        dest: 'build/vendor.min.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      target: {
        files: {
          'build/main.min.css': ['css/*.css']
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
