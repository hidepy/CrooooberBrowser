(function() {
  var CliCommand, execute, gitUtil, util;

  CliCommand = require('./cli-command');

  gitUtil = require('./git-util');

  util = require('./util');

  execute = require('./runner').execute;

  exports.listRemotes = function(options, callback) {
    var cb, command, _ref;
    _ref = util.setOptions(options, callback), options = _ref[0], callback = _ref[1];
    cb = util.wrapCallback(callback, function(err, stdout) {
      return stdout.trim().split("\n");
    });
    command = new CliCommand(['git', 'remote', 'show'], options);
    return execute(command, this._getOptions(), cb);
  };

  exports.showRemote = function(name, options, callback) {
    var cb, command, _ref;
    _ref = util.setOptions(options, callback), options = _ref[0], callback = _ref[1];
    cb = util.wrapCallback(callback, function(err, stdout) {
      return gitUtil.parseRemote(stdout);
    });
    command = new CliCommand(['git', 'remote', 'show'], name, options);
    return execute(command, this._getOptions(), cb);
  };

  exports.addRemote = function(name, url, options, callback) {
    var command, _ref;
    _ref = util.setOptions(options, callback), options = _ref[0], callback = _ref[1];
    command = new CliCommand(['git', 'remote', 'add'], [name, url], options);
    return execute(command, this._getOptions(), callback);
  };

  exports.setRemoteUrl = function(name, url, options, callback) {
    var command, _ref;
    _ref = util.setOptions(options, callback), options = _ref[0], callback = _ref[1];
    command = new CliCommand(['git', 'remote', 'set-url'], [name, url], options);
    return execute(command, this._getOptions(), callback);
  };

}).call(this);
