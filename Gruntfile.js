var path = require('path');

module.exports = function (grunt) {

// -- Config -------------------------------------------------------------------

grunt.initConfig({

    pkg      : grunt.file.readJSON('package.json'),
    normalize: grunt.file.readJSON('src/normalize/bower.json'),

    // -- Constants ------------------------------------------------------------

    BUILD_COMMENT: 'THIS FILE IS GENERATED BY A BUILD SCRIPT - DO NOT EDIT!',

    // -- Clean Config ---------------------------------------------------------

    clean: {
        build    : ['build/'],
        release  : ['release/<%= pkg.version %>/']
    },

    // -- Copy Config ----------------------------------------------------------

    copy: {

        normalize: {
            expand : true,
            flatten: true,
            cwd    : 'bower_components/normalize-css/',
            src    : '{bower.json,LICENSE.md,normalize.css}',
            dest   : 'src/normalize/',

            options: {
                processContent: function (content, file) {
                    var comment = grunt.config('BUILD_COMMENT');

                    if (grunt.file.isMatch({matchBase: true}, '*.css', file)) {
                        content = '/* ' + comment + ' */\n' + content;
                    } else if (grunt.file.isMatch({matchBase: true}, '*.html', file)) {
                        content = '<!-- ' + comment + ' -->\n' + content;
                    }

                    return content;
                }
            }
        }
    },

    // -- Concat Config --------------------------------------------------------

    concat: {
      build: {
        src: [
          'src/normalize/normalize.css',
          'src/base.css',
          'src/grids.css',
          'src/grids-r.css',
          'src/forms.css',
          'src/forms-r.css',
          'src/tables.css',
          'src/menus.css',
          'src/menus-r.css',
          'src/buttons.css',
          'src/extras.css',
          'src/helpers.css',
          'src/helpers-r.css'],
        dest: 'build/<%= pkg.name %>.css'
      }
    },

    // -- CSSLint Config -------------------------------------------------------

    csslint: {
        options: {
            csslintrc: '.csslintrc'
        },

        src: {
            src: [
                'src/*.css',
                '!src/normalize.css'
            ]
        }
    },

    // -- CSSMin Config --------------------------------------------------------

    cssmin: {
        options: {
            // report: 'gzip'
        },

        files: {
            expand: true,
            src   : 'build/*.css',
            ext   : '-min.css'
        }
    },

    // -- Compress Config ------------------------------------------------------

    compress: {
        release: {
            options: {
                archive: 'release/<%= pkg.version %>/<%= pkg.name %>-<%= pkg.version %>.zip'
            },

            expand : true,
            flatten: true,
            src    : 'build/*.css',
            dest   : '<%= pkg.name %>/<%= pkg.version %>/'
        }
    },

    // -- License Config -------------------------------------------------------

    license: {
        insert: {
            options: {
                banner: [
                    '/*!',
                    'Base.css <%= pkg.version %>',
                    'Written by Tomás Pollak',
                    'Based on Pure and Bootstrap CSS Frameworks',
                    'http://opensource.org/licenses/MIT',
                    '*/\n'
                ].join('\n')
            },

            expand: true,
            src   : ['build/*.css']
        }
    },

    // -- Watch/Observe Config -------------------------------------------------

    observe: {
        src: {
            files: 'src/**/css/*.css',
            tasks: ['test', 'suppress', 'default'],

            options: {
                interrupt: true
            }
        }
    }
});

// -- Main Tasks ---------------------------------------------------------------

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-csslint');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-compress');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.registerTask('default', [
    'clean:build',
    'concat:build',
    'cssmin',
    'concat',
    'license'
]);

grunt.registerTask('test', [
    'csslint'
]);

// Makes the `watch` task run a build first.
grunt.renameTask('watch', 'observe');
grunt.registerTask('watch', ['default', 'observe']);

grunt.registerTask('import', [
    'bower-install',
    'import-normalize'
]);

grunt.registerTask('release', [
    'test',
    'default',
    'clean:release',
    'compress:release'
]);

// -- Suppress Task ------------------------------------------------------------

grunt.registerTask('suppress', function () {
    var allowed = ['success', 'fail', 'warn', 'error'];

    grunt.util.hooker.hook(grunt.log, {
        passName: true,

        pre: function (name) {
            if (allowed.indexOf(name) === -1) {
                grunt.log.muted = true;
            }
        },

        post: function () {
            grunt.log.muted = false;
        }
    });
});

// -- Import Tasks -------------------------------------------------------------

grunt.registerTask('import-normalize', [
    'clean:build',
    'copy:normalize'
]);

// -- Bower Task ---------------------------------------------------------------

grunt.registerTask('bower-install', 'Installs Bower dependencies.', function () {
    var bower = require('bower'),
        done  = this.async();

    bower.commands.install()
        .on('data', function (data) { grunt.log.write(data); })
        .on('end', done);
});

// -- License Task -------------------------------------------------------------

grunt.registerMultiTask('license', 'Stamps license banners on files.', function () {
    var options = this.options({banner: ''}),
        banner  = grunt.template.process(options.banner),
        tally   = 0;

    this.files.forEach(function (filePair) {
        filePair.src.forEach(function (file) {
            grunt.file.write(file, banner + grunt.file.read(file));
            tally += 1;
        });
    });

    grunt.log.writeln('Stamped license on ' + String(tally).cyan + ' files.');
});

}
