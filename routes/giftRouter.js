const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const mongoose = require('mongoose');
const cors = require('./cors');

const Gifts = require('../models/gift');

const giftRouter = express.Router();

const store_id = "demo667d30040fbc3";
const store_passwd = "demo667d30040fbc3@ssl";
const is_live = false;

giftRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Gifts.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, async (req, res, next) => {
    const { trans_id } = req.body;
    try {
        const selectedGift = await Gifts.findOne({ transaction_id: trans_id });
        if (selectedGift) {
            const giftValue = selectedGift.value;
            await Gifts.deleteOne({ transaction_id: trans_id }); // Delete the gift card after it's used
            res.status(200).json({ value: giftValue });
        } else {
            res.status(404).send('Gift card not found');
        }
    } catch (err) {
        next(err);
    }
});

giftRouter.route('/sslpay')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, async (req, res, next) => {
    try {
        let gift = req.body;
        console.log(gift)
        let value = req.body.total
        let email = req.body.email
        const trans_id = new mongoose.Types.ObjectId().toString().slice(-6);
        const data = {
            total_amount: value,
            currency: 'BDT',
            tran_id: trans_id,
            success_url: `http://localhost:9000/gifts/success/${trans_id}/${value}/${email}`,
            fail_url: 'http://localhost:3030/fail',
            cancel_url: 'http://localhost:3030/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: "N/A",
            cus_email: gift.email,
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
        
        const finalGift = {
            email: gift.email,
            value: gift.value,
            phoneNumber: gift.phoneNumber,
            total: gift.total,
            transaction_id: trans_id
        };
        console.log('Redirecting to: ', GatewayPageURL);
        await Gifts.create(finalGift);

        res.send({ url: GatewayPageURL });
    } catch (err) {
        console.error('Error during processing:', err);
        next(err);
    }
});

giftRouter.route('/success/:tranId/:value/:email')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, async (req, res, next) => {
    try {
        const transactionId = req.params.tranId;
        const value = req.params.value
        const email = req.params.email
        const updatedOrder = await Gifts.findOneAndUpdate(
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
        res.redirect(`http://localhost:3000/ConFusion_Front#/gift/${transactionId}/${value}/${email}`);
    } catch (err) {
        console.error("Error processing payment success callback: ", err);
        next(err);
    }
});

module.exports = giftRouter;