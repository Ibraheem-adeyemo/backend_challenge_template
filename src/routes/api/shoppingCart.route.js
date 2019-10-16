import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';
import Validate from '../../controllers/utility/validate';
import Helper from '../../controllers/helpers/Helpers';

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post('/shoppingcart/add', ShoppingCartController.addItemToCart);
router.get('/shoppingcart/:cart_id', ShoppingCartController.getCartItems);
router.put('/shoppingcart/update/:item_id', ShoppingCartController.updateCartItem);
router.delete('/shoppingcart/empty/:cart_id', ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', ShoppingCartController.removeItemFromCart);
router.post('/orders', Validate.isLoggedIn, Helper.verifyToken, ShoppingCartController.createOrder);
router.get('/orders/inCustomer', Helper.verifyToken, ShoppingCartController.getCustomerOrders);
router.get('/orders/:order_id', ShoppingCartController.getOrderSummary);
router.post('/stripe/charge', ShoppingCartController.processStripePayment);

export default router;
