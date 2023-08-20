const { HTTP_STATUS_FORBIDDEN } = require('http2').constants;

module.exports = class ForbeddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HTTP_STATUS_FORBIDDEN;
  }
};
