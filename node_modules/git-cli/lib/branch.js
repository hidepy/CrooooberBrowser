(function() {
  var CliCommand, execute, gitUtil, util, _;

  _ = require('underscore');

  CliCommand = require('./cli-command');

  gitUtil = require('./git-util');

  util = require('./util');

  execute = require('./runner').execute;

  exports.currentBranch = function(options, callback) {
    var cb, command, _ref;
    _ref = util.setOptions(options, callback), options = _ref[0], callback = _ref[1];
    cb = util.wrapCallback(callback, function(err, stdout) {
      return gitUtil.parseCurrentBranch(stdout);
    });
    command = new CliCommand(['git', 'branch'], options);
    return execute(command, this._getOptions(), cb);
  };

  exports.branch = function(branch, options, callback) {
    var cb, command, hasName, _ref, _ref1, _ref2, _ref3;
    if (_.isString(branch)) {
      branch = [branch];
    }
    if (_.isArray(branch)) {
      _ref = [util.setOptions(options, callback), true], (_ref1 = _ref[0], options = _ref1[0], callback = _ref1[1]), hasName = _ref[1];
    } else {
      _ref2 = [util.setOptions(branch, options), false], (_ref3 = _ref2[0], options = _ref3[0], callback = _ref3[1]), hasName = _ref2[1];
    }
    if (!hasName) {
      branch = [];
    }
    cb = util.wrapCallback(callback, function(err, stdout) {
      if (!hasName) {
        return gitUtil.parseBranches(stdout);
      }
    });
    command = new CliCommand(['git', 'branch'], branch, options);
    return execute(command, this._getOptions(), cb);
  };

}).call(this);
