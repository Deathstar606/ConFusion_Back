const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
var authenticate = require('../authenticate');

const Location = require('../models/location')

const LocationRouter = express.Router();

LocationRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Location.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post( cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { name, iframe } = req.body;
    const dish = {
      name: name,
      iframe: iframe
    };
  
    try {
      console.log(dish)
      const updatedCaterMenu = await Location.create(
        dish
      );
  
      res.status(200).json(updatedCaterMenu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

LocationRouter.route('/:deleteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.cors, (req, res, next) => {
    Location.findByIdAndRemove(req.params.deleteId)
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

module.exports = LocationRouter;