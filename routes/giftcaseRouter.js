const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('./cors');

const GiftCase = require('../models/giftcase');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Gift');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const giftCaseRouter = express.Router();

giftCaseRouter.use(bodyParser.json());

giftCaseRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    GiftCase.find(req.query)
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { card_value, purchase_value } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const gifcase = {
      image: imagePath,
      card_value: card_value,
      purchase_value: purchase_value,
      createdAt: new Date()
    };
  
    try {
        const newCase = await GiftCase.create(gifcase);
        res.status(200).json(newCase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

giftCaseRouter.route('/:deleteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.delete(cors.cors, (req, res, next) => {
    GiftCase.findByIdAndRemove(req.params.deleteId)
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

module.exports = giftCaseRouter;