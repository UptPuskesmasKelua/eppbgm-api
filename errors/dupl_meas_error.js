class DuplMeasError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

exports.DuplMeasError = DuplMeasError;
