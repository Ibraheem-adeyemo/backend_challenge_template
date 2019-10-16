/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/**
 * Customer controller handles all requests that has to do with customer
 * Some methods needs to be implemented from scratch while others may contain one or two bugs
 *
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update their address info
 * - updateCreditCard - allow customers to update their credit card number
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import bcrypt from 'bcrypt';
import { Customer } from '../database/models';
import Helper from './helpers/Helpers';
import ErrorHandler from './utility/errorHandler';

/**
 *
 *
 * @class CustomerController
 */
const expiresIn = '24hrs';

class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */
  static async createCustomer(req, res, next) {
    const { body } = req;
    try {
      const customer = await Customer.scope('withoutPassword').findOrCreate({
        where: {
          email: body.email,
        },
        defaults: body,
      });
      if (customer[0]._options.isNewRecord) {
        await customer[0].reload();
        const payload = {
          id: customer[0].customer_id,
          email: customer[0].email,
        };
        const accessToken = Helper.generateToken(payload);
        return res.status(201).json({ customer, accessToken, expiresIn });
      }
      ErrorHandler.setError(409, 'USR_04', 'The email already exists', 'email');
      return ErrorHandler.send(res);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    const { body } = req;
    try {
      const customer = await Customer.findAll({
        where: {
          email: body.email,
        },
      });
      const customerObject = {};

      if (customer.length > 0) {
        for (const i in customer[0].dataValues) {
          if (i === 'password') {
            // eslint-disable-next-line no-continue
            continue;
          }
          customerObject[i] = customer[0].dataValues[i];
        }
        const isPasswordValid = await bcrypt.compare(
          body.password,
          customer[0].dataValues.password
        );
        if (isPasswordValid) {
          const accessToken = Helper.generateToken({
            id: customer.customer_id,
            email: customer.email,
          });
          return res.status(200).json({ customerObject, accessToken, expiresIn });
        }
        ErrorHandler.setError(401, 'USR_01', 'The email or password is invalid', 'email/ password');
        return ErrorHandler.send(res);
      }
      ErrorHandler.setError(404, 'USR_05', "The email doesn't exist", 'email');
      return ErrorHandler.send(res);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    try {
      const { payload } = req;
      const customer = await Customer.scope('withoutPassword').findByPk(payload.id);
      if (customer.dataValues) {
        return res.status(200).json({
          customer,
        });
      }
      ErrorHandler.setError(404, null, 'The user can not be found', 'user');
      return ErrorHandler.send(res);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    const { body, payload } = req;
    try {
      await Customer.update(body, {
        where: {
          customer_id: payload.id,
        },
      });
      const customer = await Customer.scope('withoutPassword').findByPk(payload.id);
      return res.status(200).json({ customer });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    const { body, payload } = req;
    try {
      await Customer.update(body, {
        where: {
          customer_id: payload.id,
        },
      });
      const customer = await Customer.findByPk(payload.id);
      return res.status(200).json(customer);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCreditCard(req, res, next) {
    const { body, payload } = req;
    try {
      await Customer.update(body, {
        where: {
          customer_id: payload.id,
        },
      });
      const customer = await Customer.scope('withoutPassword').findByPk(payload.id);
      for (const i in customer.dataValues) {
        if (i === 'credit_card') {
          customer.dataValues[i] = Helper.ashtericCreditCard(customer.dataValues[i]);
        }
      }
      return res.status(200).json(customer);
    } catch (error) {
      return next(error);
    }
  }

  static async localRedirect(req, res) {
    const { user } = req;
    const payload = {
      id: user[0].customer_id,
      email: user[0].email,
    };
    const accessToken = Helper.generateToken(payload);
    return res.status(200).json({ user, accessToken, expiresIn });
  }
}

export default CustomerController;
