var express = require('express');
var router = express.Router();
var axios = require('axios')

const botApi = 'https://api.telegram.org/bot890368618:AAF-8rh-KMTZg_uX5EKyp9bVKNjJZoyf2Vo/'

router.post('/netlify', (req, res, next) => {
  axios.post(
      botApi + 'sendMessage',
      {
        text: `Successful deploy. \n ${req.body.url}`,
        chat_id: 253527664
      }
  ).then(res => {
    console.log(res)
    res.send('Success')
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
})

router.post('/pictureTest', (req, res, next) => {
  axios.post(
    botApi + 'sendPhoto',
    {
      chat_id: 253527664,
      photo: `https://picsum.photos/id/${Math.floor(Math.random*1000)}/500/500`
    }
  ).then(res => {
    console.log(res)
    res.send('Success')
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
})

module.exports = router;
