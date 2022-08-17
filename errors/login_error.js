class LoginError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

exports.LoginError = LoginError;
