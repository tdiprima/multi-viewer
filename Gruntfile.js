module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %> */',
    concat: {
      options: {
        banner: '<%= banner %>\n',
        stripBanners: true,
        separator: ';'
      },
      basic: {
        src: ['src/*.js'],
        dest: 'build/<%= pkg.name %>.js'
      },
      extras: {
        src: ['vendor/**/*.js'],
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
          'build/main.min.css': ['css/quad.css', 'css/main.css']
        }
      }
    }
  })

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin'])
}
