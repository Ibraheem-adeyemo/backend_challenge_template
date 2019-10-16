/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { Router } from 'express';
import passport from 'passport';
import { validate } from '@babel/types';
import CustomerController from '../../controllers/customer.controller';
import Validate from '../../controllers/utility/validate';
import Helper from '../../controllers/helpers/Helpers';

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.post('/customers', Validate.validateCustomerSignup, CustomerController.createCustomer);
router.post('/customer', CustomerController.updateCreditCard);
router.post('/customers/login', Validate.validateCustomerLogin, CustomerController.login);
router.get(
  '/customers',
  Validate.isLoggedIn,
  Helper.verifyToken,
  CustomerController.getCustomerProfile
);
router.put(
  '/customer',
  Validate.isLoggedIn,
  Helper.verifyToken,
  CustomerController.updateCustomerProfile
);
router.get('/customers/facebook', passport.authenticate('facebook'));
router.get('/customers/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.put(
  '/customer/address',
  Validate.isLoggedIn,
  Helper.verifyToken,
  CustomerController.updateCustomerAddress
);
router.put(
  '/customer/creditCard',
  Validate.isLoggedIn,
  Validate.validateCreditCard,
  Helper.verifyToken,
  CustomerController.updateCreditCard
);

export default router;
