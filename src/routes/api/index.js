import { Router } from 'express';
import welcomeRoute from './welcome.route';
import customerRoute from './customer.route';
import productRoute from './product.route';
import shoppingCartRoute from './shoppingCart.route';
import shippingRoute from './shipping.route';
import taxRoute from './tax.route';
import attributeRoute from './attribute.route';
import authRoute from './auth.route';

const routes = Router();

routes.use('/', welcomeRoute);
routes.use('/', customerRoute);
routes.use('/', productRoute);
routes.use('/', shoppingCartRoute);
routes.use('/', shippingRoute);
routes.use('/', taxRoute);
routes.use('/', attributeRoute);
routes.use('/', authRoute);

export default routes;
