const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const CaterMenu = require('../models/cateringmenu');
const CaterOrder = require('../models/caterorder')
var authenticate = require('../authenticate');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Catering');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const CaterMenuRouter = express.Router();

CaterMenuRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    CaterMenu.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { description } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const dish = {
      image: imagePath,
      description: description,
    };
  
    try {
        console.log(dish)
      const updatedCaterMenu = await CaterMenu.create(
        dish
      );
  
      res.status(200).json(updatedCaterMenu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

CaterMenuRouter.route('/addcater')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
  CaterOrder.find(req.query)
    .then((caters) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(caters);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
  try {
    console.log(req.body)
    const newCaterOrder = await CaterOrder.create(
      req.body
    );

    res.status(200).json(newCaterOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

CaterMenuRouter.route('/:deleteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.cors, (req, res, next) => {
    CaterOrder.findByIdAndRemove(req.params.deleteId)
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

module.exports = CaterMenuRouter;