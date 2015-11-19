(function() {
  var Runner, exec;

  exec = require('child_process').exec;

  Runner = {
    execute: function(command, options, callback) {
      return exec(command.toString(), options, function(err, stdout, stderr) {
        if (callback != null) {
          return callback(err, stdout, stderr);
        }
      });
    }
  };

  module.exports = Runner;

}).call(this);
