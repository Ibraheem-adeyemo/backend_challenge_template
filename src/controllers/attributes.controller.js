/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/**
 * The controller defined below is the attribute controller, highlighted below are the functions of each static method
 * in the controller
 *  Some methods needs to be implemented from scratch while others may contain one or two bugs
 *
 * - getAllAttributes - This method should return an array of all attributes
 * - getSingleAttribute - This method should return a single attribute using the attribute_id in the request parameter
 * - getAttributeValues - This method should return an array of all attribute values of a single attribute using the attribute id
 * - getProductAttributes - This method should return an array of all the product attributes
 * NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import { Attribute, AttributeValue, ProductAttribute } from '../database/models';

class AttributeController {
  /**
   * This method get all attributes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and a list of attribute
   * @memberof attribute.controller
   */
  static async getAllAttributes(req, res, next) {
    try {
      const allAttributes = await Attribute.findAll();
      if (allAttributes) {
        return res.status(200).json(allAttributes);
      }
      return res.status(204).json({
        error: {
          status: 204,
          code: 'ATR_01',
          message: 'There is no any attribute at present.',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a single attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and an attribute item
   * @memberof attribute.controller
   */
  static async getSingleAttribute(req, res, next) {
    // eslint-disable-next-line camelcase
    const { attribute_id } = req.params;
    try {
      const singleAttribute = await Attribute.findByPk(attribute_id);
      if (singleAttribute) {
        return res.status(200).json(singleAttribute);
      }
      return res.status(204).json({
        error: {
          status: 204,
          message: `The attribute with id ${attribute_id} is not present`,  // eslint-disable-line
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and an attribute values
   * @memberof attribute.controller
   */
  static async getAttributeValues(req, res, next) {
    const { attribute_id } = req.params;
    try {
      const attributeValues = await AttributeValue.findAll({
        where: {
          attribute_id,
        },
      });
      if (attributeValues) {
        const newAttributeValues = attributeValues.map(attributeValue => {
          const { attribute_value_id, value } = attributeValue;
          const newValue = {
            attribute_value_id,
            value,
          };
          return newValue;
        });
        return res.status(200).json(newAttributeValues);
      }
      return res.status(204).json({
        error: {
          status: 204,
          message: `The attribute values with id ${attribute_id} is not present`,  // eslint-disable-line
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and the list of attribute values
   * @memberof attribute.controller
   */
  static async getProductAttributes(req, res, next) {
    const { product_id } = req.params;
    try {
      const allProductAttribute = await ProductAttribute.findAll({
        include: [
          {
            model: AttributeValue,
            include: [
              {
                model: Attribute,
                as: 'attribute_type',
              },
            ],
          },
        ],
        where: {
          product_id,
        },
      });
      if (allProductAttribute) {
        const productAttributes = allProductAttribute.map(productAttribute => {
          const {
            attribute_value_id,
            AttributeValue: {
              value,
              attribute_type: {
                name
              },
            },
          } = productAttribute;
          return {
            attribute_name: name,
            attribute_value_id,
            attribute_value: value
          }
        });
        return res.status(200).json(productAttributes);
      }
    } catch (error) {
      return next(error);
    }
  }
}

export default AttributeController;
