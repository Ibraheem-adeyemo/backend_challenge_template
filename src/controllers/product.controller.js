/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable prefer-template */
/* eslint-disable radix */
/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 *
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import {
  Product,
  Department,
  AttributeValue,
  Attribute,
  Category,
  Sequelize,
  ProductCategory,
  Review,
} from '../database/models';

const { Op } = Sequelize;

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const { query } = req;
    let { page, limit, offset } = query;

    limit = parseInt(limit) || 20;
    offset = parseInt(offset) || 0;
    page = parseInt(offset / limit + 1);

    try {
      const products = await Product.findAndCountAll({
        limit,
        offset,
        attributes: ['product_id', 'name', 'description', 'price', 'discounted_price', 'thumbnail'],
      });
      const { rows } = products;
      const paginationMeta = {
        currentPage: page,
        currentPageSize: limit,
        totalPages: parseInt(products.count / limit),
        totalrecords: products.count,
      };
      const allProducts = {
        paginationMeta,
        rows,
      };
      return res.status(200).json(allProducts);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    const { query_string, all_words } = req.query;  // eslint-disable-line
    let { page, limit } = req.query;

    limit = parseInt(limit || 20);
    page = parseInt(page || 1);
    const offset = parseInt(limit * page) || 0;

    try {
      const searchedProducts = await Product.findAndCountAll({
        limit,
        offset,
        attributes: ['product_id', 'name', 'description', 'price', 'discounted_price', 'thumbnail'],
        where: {
          [Op.or]: [
            {
              description: {
                [Op.like]: '%' + query_string + '%',
              },
            },
            {
              name: {
                [Op.like]: '%' + query_string + '%',
              },
            },
          ],
        },
      });
      return res.status(200).json({ rows: searchedProducts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    try {
      const { category_id } = req.params; // eslint-disable-line
      let { page, limit } = req.query;

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;
      const offset = (page - 1) * limit;

      const products = await ProductCategory.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            attributes: [
              'product_id',
              'name',
              'description',
              'price',
              'discounted_price',
              'thumbnail',
            ],
          },
        ],
        where: {
          category_id,
        },
        limit,
        offset,
      });
      const allProducts = products.map(eachProduct => {
        const { product } = eachProduct;
        return product;
      });
      return res.status(200).json({ rows: allProducts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    const { department_id } = req.params;
    let { page, limit } = req.query;

    try {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;
      const offset = (page - 1) * limit;

      const products = await Category.findAndCountAll({
        where: { department_id },
        include: [
          {
            model: Product,
            attributes: [
              'product_id',
              'name',
              'description',
              'price',
              'discounted_price',
              'thumbnail',
            ],
          },
        ],
        limit,
        offset,
      });
      const allProducts = products.rows.map(eachProduct => {
        const { Products } = eachProduct.dataValues;
        return Products;
      });
      return res.status(200).json({ rows: allProducts[0] });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line

    try {
      const product = await Product.findByPk(product_id);
      if (product !== null) {
        return res.status(200).json(product);
      }
      return res.status(404).json('The product can not be found');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and a department details
   * @memberof ProductController
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    try {
      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(200).json(department);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${department_id} has no item`,  // eslint-disable-line
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and categories list
   * @memberof ProductController
   */
  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json({ rows: categories });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and a single category
   * @memberof ProductController
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;  // eslint-disable-line
    try {
      const category = await Category.findByPk(category_id);
      if (category) {
        return res.status(200).json(category);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Category with id ${category_id} does not exist`,  // eslint-disable-line
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;  // eslint-disable-line
    try {
      const departmentCategories = await Category.findAll({
        where: {
          department_id,
        },
      });

      if (departmentCategories) {
        return res.status(200).json({ rows: departmentCategories });
      }
      return res.status(404).json({
        error: {
          status: 404,
          // eslint-disable-next-line camelcase
          message: `The category with the department id ${department_id} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method return the category of a product
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {json} json object with status and category of a product
   * @memberof ProductController
   *  */
  static async getProductCategory(req, res, next) {
    // eslint-disable-next-line camelcase
    const { product_id } = req.params;
    try {
      let category = await Category.findAll({
        include: [
          {
            model: Product,
            where: {
              product_id,
            },
          },
        ],
      });
      if (category) {
        // eslint-disable-next-line camelcase
        const { category_id, department_id, name } = category[0].dataValues;
        category = {
          category_id,
          department_id,
          name,
        };
        return res.status(200).json(category);
      }
      return res.status(404).json({
        error: {
          status: 404,
          // eslint-disable-next-line camelcase
          message: `Product category with the Product id ${product_id} does not exist`,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This mmethod add review to the review table
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @return {json} json object with status code and review of a product
   * @memberof ProductController
   *  */

  static async addProductReview(req, res, next) {
    const { product_id } = req.params;
    const { customer_id, rating, review } = req.body;

    const reviewObject = {
      product_id,
      customer_id,
      rating,
      review,
    };
    try {
      const productReview = await Review.findOrCreate({
        where: {
          product_id,
          customer_id,
        },
        defaults: reviewObject,
      });
      if (!productReview[1]) {
        Review.update({ rating, review }, { where: { customer_id } });
        return res.status(201).json({ message: 'Your review was updated successfully' });
      }
      return res.status(201).json(productReview);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This methhod return reviews of a product
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns {*} Json object with status code and list of a product's review
   * @memberof ProductController
   *  */

  static async getProductReview(req, res, next) {
    const { product_id } = req.params;

    try {
      const reviews = await Product.findAll({
        include: [
          {
            model: Review,
            where: {
              product_id,
            },
            attributes: ['review', 'rating', 'created_on'],
          },
        ],
        attributes: ['name'],
      });
      if (reviews.length < 1) {
        return res
          .status(404)
          .json({ message: `Product with product_id ${product_id} has no reviews` });
      }
      return res.status(200).json(reviews[0]);
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;
