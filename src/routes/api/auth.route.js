import { Router } from 'express';
import passport from 'passport';
import CustomerController from '../../controllers/customer.controller';

const router = Router();
router.get(
  '/auth/facebook/redirect',
  passport.authenticate('google', { session: false }),
  CustomerController.localRedirect
);

export default router;
