const router = require('express').Router();
const paymentController = require("../controler/paymentControler");
const middleware = require("../BkMiddleware");
const cors = require('./cors'); // Import the cors module

router.post('/bkash/payment/create', cors.corsWithOptions, middleware.bkash_auth, paymentController.payment_create);
router.get('/bkash/payment/callback', cors.corsWithOptions, middleware.bkash_auth, paymentController.call_back);
router.get('/bkash/payment/refund/:trxID', cors.corsWithOptions, middleware.bkash_auth);

module.exports = router;