module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    concat: {
      js: {
        // src: ['src/**/*.js'],
        src: ['js/*.js'],
        dest: 'build/js/ultraviewer.js'
      }
    }
    // uglify: {
    //   my_target: {
    //     files: {
    //       'build/js/ultraviewer.min.js': ['js/*.js']
    //       // 'build/js/ultraviewer.min.js': ['build/js/ultraviewer.js']
    //     }
    //   }
    // }
    //, watch: {
    //   js: {
    //     files: ['js/*.js'],
    //     tasks: ['concat'],
    //     options: {
    //       spawn: false
    //     }
    //   }
    // }
  })
  grunt.loadNpmTasks('grunt-contrib-concat')
  // grunt.loadNpmTasks('grunt-contrib-uglify')
  // grunt.loadNpmTasks('grunt-contrib-watch')
  // grunt.registerTask('default', ['concat', 'watch'])
}
