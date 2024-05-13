const express = require('express');
const subcribeRouter = express.Router();
const mailchimp = require('@mailchimp/mailchimp_marketing');

mailchimp.setConfig({
  apiKey: process.env.chimp_apiKey,
  server: process.env.chimp_server
});

subcribeRouter.use(bodyParser.json());

subcribeRouter.post('/', async (req, res) => {
    const { email } = req.body;
  
    try {
      const response = await mailchimp.lists.addListMember('YOUR_AUDIENCE_ID', {  //change YOUR_AUDIENCE_ID
        email_address: email,
        status: 'subscribed',
      });
      res.status(200).json({ message: 'Success! Check your email to confirm your subscription.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error subscribing. Please try again later.' });
    }
  });
  
  module.exports = subcribeRouter;

