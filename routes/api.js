var express = require('express');
var router = express.Router();
var axios = require('axios')

router.post('/netlify', (req, res, next) => {
  res.send(JSON.stringify(req.body))
  axios.post(
      'https://api.telegram.org/bot890368618:AAF-8rh-KMTZg_uX5EKyp9bVKNjJZoyf2Vo/sendMessage',
      {
        text: JSON.stringify(req.body),
        chat_id: 253527664
      }
  ).then(res => {console.log(res)})
      .catch(err => {console.log(err)})
})

module.exports = router;
