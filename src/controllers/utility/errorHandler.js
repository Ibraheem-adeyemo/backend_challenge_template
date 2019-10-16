export default class ErrorHandler {
  /**
   * @method constructor
   */

  constructor() {
    this.status = null;
    this.code = null;
    this.message = null;
    this.feild = null;
  }

  /**
   * @method setError
   * @description set error response
   * @param {object} status
   * @param {object}  code
   * @param {object} message
   * @param {object} feild
   * */
  static setError(status, code, message, feild) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.feild = feild;
  }

  /**
   * @method send
   * @description send error response
   * @static
   * @param {object} res - Response object
   * @returns {object} json object
   * @memberof ErrorHandler
   * */
  static send(res) {
    const error = {
      status: this.status,
      code: this.code,
      message: this.message,
      feild: this.feild,
    };
    const output = res.status(this.status).json({ error });
    return output;
  }
}
