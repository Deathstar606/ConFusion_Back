const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Reservations = require('../models/reserve');
const ResSeat = require('../models/resSeat');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Seats');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const store_id = "demo667d30040fbc3";
const store_passwd = "demo667d30040fbc3@ssl";
const is_live = false;

const resRouter = express.Router();

resRouter.use(bodyParser.json());

resRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Reservations.find(req.query)
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, async (req, res, next) => {
    try {
        let reserve = req.body;
        let email = req.body.email
        const trans_id = new mongoose.Types.ObjectId().toString().slice(-6);
        const data = {
            total_amount: reserve.total,
            currency: 'BDT',
            tran_id: trans_id,
            success_url: `http://localhost:9000/reservation/success/${trans_id}/${email}`,
            fail_url: 'http://localhost:3030/fail',
            cancel_url: 'http://localhost:3030/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: "N/A",
            cus_email: reserve.email,
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
        
        const finalRes = {
            people: reserve.people,
            date: reserve.date,
            time: reserve.time,
            email: reserve.email,
            payment_stat: false,
            transaction_id: trans_id
        };
        console.log('Redirecting to: ', GatewayPageURL);
        await Reservations.create(finalRes);

        res.send({ url: GatewayPageURL });
    } catch (err) {
        console.error('Error during processing:', err);
        next(err);
    }
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, (req, res, next) => {
    Reservations.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

resRouter.route('/resseat')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    ResSeat.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { seat_value } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const seat = {
      image: imagePath,
      seat_value: seat_value,
    };
  
    try {
        console.log(seat)
        const updatedReservationSeat = await ResSeat.create(
            seat
        );
  
      res.status(200).json(updatedReservationSeat);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

resRouter.route('/success/:tranId/:email')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, async (req, res, next) => {
    try {
        const transactionId = req.params.tranId;
        const email = req.params.email
        const updatedOrder = await Reservations.findOneAndUpdate(
            { transaction_id: transactionId }, //Fix
            { $set: { payment_stat: true } }, //Fix
            { new: true }
        );
        if (!updatedOrder) {
            console.log("Transaction not found for ID: ", transactionId);
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({ message: 'Transaction not found' });
            return;
        }
        res.redirect(`http://localhost:3000/ConFusion_Front#/reserve/${transactionId}/${email}`);
    } catch (err) {
        console.error("Error processing payment success callback: ", err);
        next(err);
    }
});


module.exports = resRouter;