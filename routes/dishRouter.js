const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Dishes = require('../models/dishes');
var authenticate = require('../authenticate');

const storageD = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const storageC = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Category');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const uploadDish = multer({ storage: storageD });
const uploadCat = multer({ storage: storageC });

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dishes.find(req.query)
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(uploadCat.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin,  */ async (req, res, next) => {
    const { name } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const dish = {
      image: imagePath,
      name: name,
    };
    try {
        console.log(dish)
        const updatedCaterMenu = await Dishes.create(
            dish
        );
  
      res.status(200).json(updatedCaterMenu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})
.delete(cors.corsWithOptions, async (req, res, next) => {
    const { _id } = req.body;
    try {
        const deletedCategory = await Dishes.findOneAndRemove({ _id: _id });

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(deletedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
/* .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
*/

dishRouter.route('/addDish')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(uploadDish.single('image'), cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { category, name, ingreds, description, price } = req.body;
    let imagePath = req.file ? req.file.path : '';
    imagePath = imagePath.replace(/^public[\/\\]/, '');
    const dish = {
      _id: new mongoose.Types.ObjectId(),
      name,
      ingreds,
      description,
      price,
      image: imagePath,
      createdAt: new Date()
    };
  
    try {
      const updatedCategory = await Dishes.findOneAndUpdate(
        { name: category },
        { $push: { items: dish } },
        { new: true, upsert: true }
      );
  
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})
.put(cors.corsWithOptions, uploadDish.single('image'), async (req, res) => {
    const { category, _id, ...updateFields } = req.body;
    try {
        const dish = await Dishes.findOne({ name: category, 'items._id': mongoose.Types.ObjectId(_id) });
        if (!dish) {
            return res.status(404).json({ message: 'Category or item not found' });
        }

        const itemIndex = dish.items.findIndex(item => item._id.toString() === _id);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const oldImagePath = path.join('public', dish.items[itemIndex].image);
        
        if (req.file) {
            newImgPath = req.file.path;
            updateFields['image'] = newImgPath.replace(/^public[\/\\]/, '');
        }

        const updatedDish = await Dishes.findOneAndUpdate(
            { name: category, 'items._id': mongoose.Types.ObjectId(_id) },
            { $set: Object.keys(updateFields).reduce((acc, key) => {
                acc[`items.$[elem].${key}`] = updateFields[key];
                return acc;
            }, {}) },
            { arrayFilters: [{ 'elem._id': mongoose.Types.ObjectId(_id) }], new: true }
        );

        if (!updatedDish) {
            return res.status(404).json({ message: 'Category or item not found after update' });
        }

        if (req.file && oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                }
            });
        }

        res.status(200).json(updatedDish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
.delete(cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { category, _id } = req.body;
    console.log(category, _id)
    try {
        const updatedCategory = await Dishes.findOneAndUpdate(
            { name: category },
            { $pull: { items: { _id: mongoose.Types.ObjectId(_id) } } },
            { new: true }
        );
    
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

dishRouter.route('/avail')
.post(cors.corsWithOptions, /* authenticate.verifyUser, authenticate.verifyAdmin, */ async (req, res) => {
    const { name, _id, availability } = req.body;
    try {
        const updatedCategory = await Dishes.findOneAndUpdate(
            { name: name, "items._id": _id }, // Query to match category name and dish ID
            { $set: { "items.$.availability": availability } }, // Update the availability field
            { new: true, upsert: true } // Return the updated document
        );
  
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Dishes.find({})
    .then((dishes) => {
        if (dishes && dishes.length > 0) {
            const allItems = dishes.flatMap(obj => obj.items); // Flatten the nested items arrays
            const dish = allItems.find((item) => item._id.toString() === req.params.dishId);
            if (dish) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            } else {
                const err = new Error(`Dish ${req.params.dishId} not found`);
                err.status = 404;
                return next(err);
            }
        } else {
            const err = new Error('No dishes found');
            err.status = 404;
            return next(err);
        }
    })
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })            
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'
        + req.params.dishId + '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
        + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null 
        && dish.comments.id(req.params.commentId).author == req.user._id) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })              
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('You are not the author mofo');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null 
        && dish.comments.id(req.params.commentId).author == req.user._id) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })              
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('You are not the author mofo');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = dishRouter;