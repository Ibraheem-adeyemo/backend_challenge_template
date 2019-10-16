/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 *
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new product to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a product in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a product from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import uniqid from 'uniqid';
import { Order, OrderDetail, ShoppingCart, Product, Customer } from '../database/models';
import ErrorHandler from './utility/errorHandler';

/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   */
  static generateUniqueCart(req, res) {
    const uniqueCartId = uniqid();
    return res.status(200).json({ cart_id: uniqueCartId });
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async addItemToCart(req, res, next) {
    const { body } = req;
    try {
      const newCartItem = await ShoppingCart.findOrCreate({
        where: {
          cart_id: body.cart_id,
          product_id: body.product_id,
          attributes: body.attributes,
        },
        defaults: body,
      });
      if (!newCartItem[0]._options.isNewRecord) {
        return res.status(208).json({ message: 'You have already added this item to the cart' });
      }
      return res.status(201).json({ message: newCartItem });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get shopping cart using the cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async getCartItems(req, res, next) {
    const { cart_id } = req.params;
    try {
      const cartItems = await ShoppingCart.findAll({
        include: [
          {
            model: Product,
            attributes: ['name', 'price', 'image', 'discounted_price'],
          },
        ],
        where: {
          cart_id,
        },
      });
      const newCartItem = cartItems.map(record => {
        const {
          item_id,
          attributes,
          product_id,
          quantity,
          Product: { name, price, image, discounted_price },
        } = record;

        const subtotal = quantity * price;
        return {
          name,
          price,
          image,
          discounted_price,
          item_id,
          cart_id,
          attributes,
          product_id,
          quantity,
          subtotal,
        };
      });
      return res.status(200).json(newCartItem);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update cart item quantity using the item_id in the request param
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async updateCartItem(req, res, next) {
    const { item_id } = req.params // eslint-disable-line
    const { body } = req;
    try {
      await ShoppingCart.update(
        {
          quantity: body.quantity,
        },
        {
          where: {
            item_id,
          },
        }
      );
      const updatedItem = await ShoppingCart.findByPk(item_id);
      return res.status(200).json(updatedItem);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async emptyCart(req, res, next) {
    const { cart_id } = req.params;
    try {
      await ShoppingCart.destroy({
        where: {
          cart_id,
        },
      });
      const deletedItem = await ShoppingCart.findAll({
        where: {
          cart_id,
        },
      });
      return res.status(200).json(deletedItem);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   */
  static async removeItemFromCart(req, res, next) {
    const { item_id } = req.params;
    try {
      const deletedItem = await ShoppingCart.destroy({
        where: {
          item_id,
        },
      });
      if (!deletedItem) {
        return res.status(404).json({ message: 'The item is not found' });
      }
      return res.status(200).json({ message: 'The item is removed successfully' });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrder(req, res, next) {
    const { body, payload } = req;
    try {
      if (body.total_amount) {
        ErrorHandler.setError(400, Null, 'Total_amount is not valid', 'Total-amount');
        return ErrorHandler.send(res);
      }
      const orderData = { ...body, customer_id: payload.id };
      const order = await Order.findOrCreate({
        where: {
          customer_id: payload.id,
          status: false,
        },
        defaults: orderData,
      });
      return res.status(201).json({ order_id: order.order_id });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order details from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrderDetails(req, res, next) {
    const { body } = req;
    try {
      const orderdItems = await OrderDetail.bulkCreate(body);
      return res.status(201).json(orderdItems);
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   */
  static async getCustomerOrders(req, res, next) {
    const { payload } = req;  // eslint-disable-line
    try {
      const orderItem = await Customer.findByPk(payload.id, {
        attributes: ['name'],
        include: [
          {
            model: Order,
            attributes: ['order_id', 'total_amount', 'created_on', 'shipped_on'],
          }
        ],
      });
      return res.status(200).json(orderItem);
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   */
  static async getOrderSummary(req, res, next) {
    const { order_id } = req.params;  // eslint-disable-line
    const { customer_id } = req;   // eslint-disable-line
    try {
      const oderItem = await OrderDetail.findAll({
        where: {
          order_id,
        },
      });
      return res.status(200).json({
        order_id,
        order_item: oderItem,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    const { email, stripeToken, order_id } = req.body; // eslint-disable-line
    const { customer_id } = req;  // eslint-disable-line
    try {
      // implement code to process payment and send order confirmation email here
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
