var express = require('express');
const bodyParser = require('body-parser');
var Payment = require('../models/payment');
var authenticate = require('../authenticate');
const cors = require('./cors');
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options('*', (req, res) => { res.sendStatus(200); } )

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    try {
      const payments = await Payment.find({});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(payments);
    } catch (err) {
      next(err);
    }
  });

router.delete('/:paymentID', async (req, res) => {

  try {
    // Find the user by userId and remove it
    const result = await Payment.findOneAndRemove(req.params.paymentID);

    if (result) {
      res.status(204).send(); // User deleted successfully (No Content)
    } else {
      res.status(404).json({ error: 'Payment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
