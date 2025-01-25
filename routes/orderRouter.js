const express = require('express');
const bodyParser = require('body-parser');
const SSLCommerzPayment = require('sslcommerz-lts');
const mongoose = require('mongoose');
const cors = require('./cors');

const Orders = require('../models/order');

const ordRouter = express.Router();

const store_id = "demo667d30040fbc3";
const store_passwd = "demo667d30040fbc3@ssl";
const is_live = false;

ordRouter.use(bodyParser.json());

ordRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Orders.find(req.query)
    .sort({ _id: -1 })  // Sorting the orders by _id in descending order
    .then((orders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(orders);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {
    Orders.create(req.body)
    .then((ord) => {
        console.log('Order Created at', ord);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(ord);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
/* .delete(cors.corsWithOptions, (req, res, next) => {
    Reservations.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
}); */

ordRouter.route('/sslpay')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, async (req, res, next) => {
    try {
        let order = req.body;
        const trans_id = new mongoose.Types.ObjectId().toString();
        const data = {
            total_amount: order.total,
            currency: 'BDT',
            tran_id: trans_id,
            success_url: `https://con-fusion-back.vercel.app/orders/success/${trans_id}`, //http://localhost:9000/
            fail_url: 'http://localhost:3030/fail',
            cancel_url: 'http://localhost:3030/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: order.firstName,
            cus_email: order.email,
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const apiResponse = await sslcz.init(data);
        let GatewayPageURL = apiResponse.GatewayPageURL;
        
        const finalOrder = {
            firstName: order.firstName,
            lastName: order.lastName,
            address: order.address,
            email: order.email,
            order_type: order.order_type,
            gift_stat: order.gift_stat,
            phoneNumber: order.phoneNumber,
            total: order.total,
            items: order.items,
            transaction_id: trans_id
        };
        console.log('Redirecting to: ', GatewayPageURL);

        await Orders.create(finalOrder);

        res.send({ url: GatewayPageURL });
    } catch (err) {
        console.error('Error during processing:', err);
        next(err);
    }
});

ordRouter.route('/cod')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, async (req, res, next) => {
    try {
        const order = req.body
        const trans_id = new mongoose.Types.ObjectId().toString();
        const finalOrder = {
            firstName: order.firstName,
            lastName: order.lastName,
            address: order.address,
            email: order.email,
            order_type: order.order_type,
            phoneNumber: order.phoneNumber,
            total: order.total,
            items: order.items,
            transaction_id: trans_id
        };
        await Orders.create(finalOrder)
        res.send(finalOrder)
    } catch (err) {
        console.error('Error during order creation:', err);
        next(err);
    }
})

ordRouter.route('/onsite')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, async (req, res, next) => {
    try {
        const order = req.body
        const trans_id = new mongoose.Types.ObjectId().toString();
        const finalOrder = {
            firstName: order.firstName,
            lastName: order.lastName,
            address: order.address,
            email: order.email,
            order_type: order.order_type,
            order_stat: true,
            payment_stat: true,
            phoneNumber: order.phoneNumber,
            total: order.total,
            items: order.items,
            transaction_id: trans_id
        };
        await Orders.create(finalOrder)
        res.send(finalOrder)
    } catch (err) {
        console.error('Error during order creation:', err);
        next(err);
    }
})

ordRouter.route('/success/:tranId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, async (req, res, next) => {
    try {
        const transactionId = req.params.tranId;
        const updatedOrder = await Orders.findOneAndUpdate(
            { transaction_id: transactionId },
            { $set: { payment_stat: true } },
            { new: true }
        );
        if (!updatedOrder) {
            console.log("Transaction not found for ID: ", transactionId);
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({ message: 'Transaction not found' });
            return;
        }
        res.redirect(`https://deathstar606.github.io/ConFusion_Front#/paystat/${transactionId}`);  //http://localhost:3000/
    } catch (err) {
        console.error("Error processing payment success callback: ", err);
        next(err);
    }
});

ordRouter.route('/comp')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, async (req, res, next) => {
    const { _id } = req.body;
    try {
        const upDish = await Orders.findOneAndUpdate(
            { _id: _id },
            { $set: { order_stat: true } },
            { new: true } // Option to return the updated document
        );
        console.log(upDish)
        if (upDish) {
            res.status(200).json(upDish);
        } else {
            res.status(404).send('Order not found');
        }
    } catch (err) {
        next(err); // Pass errors to the error handler
    }
})
.delete(cors.cors, async (req, res, next) => {
    const { _id } = req.body;
    try {
        const deletedOrder = await Orders.findOneAndDelete({ _id: _id });
        if (deletedOrder) {
            res.status(200).json(deletedOrder);
        } else {
            res.status(404).send('Order not found');
        }
    } catch (err) {
        next(err); // Pass errors to the error handler
    }
});

module.exports = ordRouter;