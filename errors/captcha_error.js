class CaptchaError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

exports.CaptchaError = CaptchaError;
