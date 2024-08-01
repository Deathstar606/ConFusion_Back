const express = require('express');
const bodyParser = require('body-parser');
const SSLCommerzPayment = require('sslcommerz-lts');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Events = require('../models/events');
const Tickets = require('../models/tickets')
var authenticate = require('../authenticate');

const store_id = "demo667d30040fbc3";
const store_passwd = "demo667d30040fbc3@ssl";
const is_live = false;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Events');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const EventRouter = express.Router();

EventRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Events.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { name, description, action } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const dish = {
      image: imagePath,
      name: name,
      description: description,
      action: action
    };
  
    try {
        console.log(dish)
      const updatedCaterMenu = await Events.create(
        dish
      );
  
      res.status(200).json(updatedCaterMenu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

EventRouter.route('/ticket')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, async (req, res, next) => {
  try {
      let ticket = req.body
      let email = ticket.email
      const trans_id = new mongoose.Types.ObjectId().toString().slice(-6);
      const data = {
          total_amount: 10,
          currency: 'BDT',
          tran_id: trans_id,
          success_url: `http://localhost:9000/events/success/${trans_id}/${email}`,
          fail_url: 'http://localhost:3030/fail',
          cancel_url: 'http://localhost:3030/cancel',
          ipn_url: 'http://localhost:3030/ipn',
          shipping_method: 'Courier',
          product_name: 'Computer',
          product_category: 'Electronic',
          product_profile: 'general',
          cus_name: "N/A",
          cus_email: ticket.email,
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
          email: ticket.email,
          payment_stat: false,
          transaction_id: trans_id
      };
      console.log('Redirecting to: ', GatewayPageURL);
      await Tickets.create(finalRes);

      res.send({ url: GatewayPageURL });
  } catch (err) {
      console.error('Error during processing:', err);
      next(err);
  }
})

EventRouter.route('/:deleteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.cors, (req, res, next) => {
    Events.findByIdAndRemove(req.params.deleteId)
    .then((response) => {
        if (response) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        } else {
            const err = new Error(`GiftCase ${req.params.deleteId} not found`);
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

EventRouter.route('/success/:tranId/:email')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, async (req, res, next) => {
    try {
        const transactionId = req.params.tranId;
        const email = req.params.email
        const updatedOrder = await Tickets.findOneAndUpdate(
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
        res.redirect(`http://localhost:3000/ConFusion_Front#/events/${transactionId}/${email}`); ////////Change
    } catch (err) {
        console.error("Error processing payment success callback: ", err);
        next(err);
    }
});

module.exports = EventRouter;