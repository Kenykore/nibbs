'use strict';
require('dotenv').config();
const response = require('./response');

/**
 * Class for error handling
 */
class ErrorHandler {
  /**
     * methods to return error messafes
     *
     * @param   {Object}  err  error stacl
     * @param   {Object}  req  request object
     * @param   {Object}  res  response object
     * @return  {Object}
     */
  static handleError(err, req, res) {
    const error_stack = (process.env.ENVIRONMENT !== 'production') ? err.stack : {};
    return response.sendFatalError({res, error: err.errors, message: err.message, error_stack});
  }
}

module.exports = ErrorHandler;


