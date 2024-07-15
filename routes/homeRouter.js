const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Home = require('../models/home');
var authenticate = require('../authenticate');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Home');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

const homeRouter = express.Router();

homeRouter.use(bodyParser.json());

homeRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Home.find(req.query)
    .then((home) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(home);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(upload.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin,  */ async (req, res, next) => {
    const homeItem = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    homeItem.image = imagePath;
    const finalHome = { ...homeItem };
    try {
        const createdHome = await Home.create(finalHome);
        res.status(200).json(createdHome);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
.put(cors.corsWithOptions, upload.single('image'), async (req, res) => {
    const updateFields = req.body;

    try {
        const home = await Home.findOne({ name: updateFields.name });
        if (!home) {
            return res.status(404).json({ message: 'Category or item not found' });
        }

        const oldImagePath = path.join('public', home.image);
        console.log(oldImagePath)
        
        if (req.file) {
            const newImgPath = req.file.path;
            updatedImage = newImgPath.replace(/^public[\/\\]/, '');
            updateFields.image = updatedImage
        }

        const updatedHome = await Home.findOneAndUpdate(
            { name: updateFields.name },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedHome) {
            return res.status(404).json({ message: 'Category or item not found after update' });
        }

        if (req.file && oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                }
            });
        }

        res.status(200).json(updatedHome);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = homeRouter;