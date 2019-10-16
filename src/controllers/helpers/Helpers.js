import jwt from 'jsonwebtoken';
import ErrorHandler from '../utility/errorHandler';

const secret = process.env.JWT_KEY;

class Helper {
  /**
   * @method generateToken
   * @description To generate a user token
   * @static
   * @param {object} payload
   * @return {object} JSON response
   * @memberof Helper
   * */
  static generateToken(payload) {
    const token = jwt.sign(payload, secret, {
      expiresIn: '24hrs',
    });
    return token;
  }

  /**
   * @method verifyToken
   * @description To verify a user token
   * @static
   * @param {object} token
   * @return {object} JSON response
   * @memberof Helper
   * */
  static verifyToken(req, res, next) {
    const { token } = req.headers;
    jwt.verify(token, secret, (err, payload) => {
      if (!err) {
        req.payload = payload;
        return next();
      }
      ErrorHandler.setError(400, 'AUT_03', 'Invalid token', 'Token');
      return ErrorHandler.send(res);
    });
  }

  /**
   * @method ashtericCreditCard
   * @description To hide credit card details
   * @static
   * @param {*} number
   * @returns {string} string
   *  */
  static ashtericCreditCard(number) {
    const card = number.split('');
    return `XXXXXXXXXXXXXXXX${card.splice(card.length - 4).join('')}`;
  }
}

export default Helper;
