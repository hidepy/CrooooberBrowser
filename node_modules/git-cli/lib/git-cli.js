(function() {
  var errors;

  errors = require('./errors');

  module.exports = {
    Repository: require('./repository'),
    GitError: errors.GitError,
    BadRepositoryError: errors.BadRepositoryError
  };

}).call(this);
