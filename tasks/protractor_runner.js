/*
 * grunt-protractor-runner
 * https://github.com/teerapap/grunt-protractor-runner
 *
 * Copyright (c) 2013 Teerapap Changwichukarn
 * Licensed under the MIT license.
 */

'use strict';

var os = require('os');

module.exports = function(grunt) {

  grunt.registerMultiTask('protractor', 'A grunt task to run protractor.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var opts = this.options({
      configFile: 'node_modules/protractor/referenceConf.js',
      keepAlive: true,
      args: {}
    });

    // Merge options onto data, with data taking precedence
    opts = grunt.util._.merge(opts, this.data);
    var keepAlive = opts['keepAlive'];
    var strArgs = ["seleniumAddress", "seleniumServerJar", "seleniumPort", "baseUrl", "rootElement"];
    var listArgs = ["specs"];
    var boolArgs = ["includeStackTrace", "verbose"];

    var args = [opts.configFile];
    // Iterate over all supported arguments.
    strArgs.forEach(function(a) {
      if (a in opts.args) {
        args.push('--'+a, opts.args[a]);
      }
    });
    listArgs.forEach(function(a) {
      if (a in opts.args) {
        args.push('--'+a, opts.args[a].join(","));
      }
    });
    boolArgs.forEach(function(a) {
      if (a in opts.args) {
        args.push('--'+a);
      }
    });

    var done = this.async();
    var PROTRACTOR_CMD_WINDOWS = 'node_modules/.bin/protractor.cmd';
    var PROTRACTOR_CMD_UNIX = './node_modules/protractor/bin/protractor';
    // Spawn protractor command
    grunt.util.spawn({
        cmd: (os.platform() === 'win32') ? PROTRACTOR_CMD_WINDOWS : PROTRACTOR_CMD_UNIX,
        args: args,
        opts: {
          stdio:'inherit'
        }
      },
      function(error, result, code) {
        if (error) {
          grunt.log.error(String(result));
          if(code === 1 && keepAlive) {
            // Test fails but do not want to stop the grunt process.
            done();
            done = null;
          } else {
            // Test fails and want to stop the grunt process,
            // or protractor exited with other reason.
            grunt.fail.fatal('protractor exited with code: '+code, 3);
          }
        } else {
          done();
          done = null;
        }
      }
    );
  });

};
