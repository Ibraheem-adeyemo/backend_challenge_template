import ErrorHandler from './errorHandler';

class Validate {
  /**
   * This ensure name is string and contain a space
   * @static
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @return {object} next()
   *  */
  static validateCustomerSignup(req, res, next) {
    const { body } = req;
    if (!body.name) {
      ErrorHandler.setError(400, 'USR_02', 'The feild is required', 'Name');
      return ErrorHandler.send(res);
    }
    if (!/^[a-zA-Z]{3,}$/.test(body.name)) {
      ErrorHandler.setError(400, 'USR_01', 'Name must be string with 3 or more character', 'Name');
      return ErrorHandler.send(res);
    }
    if (!body.email) {
      ErrorHandler.setError(400, 'USR_02', 'The feild is required', 'Email');
      return ErrorHandler.send(res);
    }
    if (!/^[a-zA-Z].+@.+\..+$/.test(body.email)) {
      ErrorHandler.setError(400, 'USR_02', 'Kindly use correct email format', 'Email');
      return ErrorHandler.send(res);
    }
    if (!body.password) {
      ErrorHandler.setError(400, null, 'The feild is required', 'Password');
      return ErrorHandler.send(res);
    }
    if (!/^.{3,}$/.test(body.password)) {
      ErrorHandler.setError(400, 'USR_02', 'Password must be 3 or more character', 'Password');
      return ErrorHandler.send(res);
    }
    return next();
  }

  /**
   * This ensure name is string and contain a space
   * @static
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @return {object} next()
   *  */
  static validateCustomerLogin(req, res, next) {
    const { body } = req;
    if (!body.email) {
      ErrorHandler.setError(400, 'USR_02', 'The feild is required', 'Email');
      return ErrorHandler.send(res);
    }
    if (!/^[a-zA-Z].+@.+\..+$/.test(body.email)) {
      ErrorHandler.setError(400, 'USR_02', 'The email provided is not correct', 'Email');
      return ErrorHandler.send(res);
    }
    if (!body.password) {
      ErrorHandler.setError(400, null, 'The feild is required', 'Password');
      return ErrorHandler.send(res);
    }
    return next();
  }

  /**
   * This ensure user is loged in
   * @method authenticate
   * @description authenticate logged in user
   * @static
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @return {object} json
   * */
  static isLoggedIn(req, res, next) {
    const { token } = req.headers;
    if (!token) {
      ErrorHandler.setError(401, 'AUT_01', 'Authorization code is empty', 'Authentication');
      return ErrorHandler.send(res);
    }
    return next();
  }

  /**
   * @method validateCreditCard
   * @static
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @return {object} json
   * */
  static validateCreditCard(req, res, next) {
    const { body } = req;
    if (!/^[\d]{20}$/.test(body.credit_card)) {
      ErrorHandler.setError(400, null, 'Invalid credit card number', 'Credit card');
      return ErrorHandler.send(res);
    }
    return next();
  }
}

export default Validate;
