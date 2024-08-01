const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Gallery = require('../models/gallery');
var authenticate = require('../authenticate');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Gallery');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const GalleryRouter = express.Router();

GalleryRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Gallery.find(req.query)
    .then((gifts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(gifts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const dish = {
      image: imagePath
    };
  
    try {
      console.log(dish)
      const updatedCaterMenu = await Gallery.create(
        dish
      );
  
      res.status(200).json(updatedCaterMenu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})

GalleryRouter.route('/:deleteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.cors, (req, res, next) => {
  Gallery.findByIdAndRemove(req.params.deleteId)
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

module.exports = GalleryRouter;