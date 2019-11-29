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
  if (req.body.message.text === "/raspisaniehochu") {
    axios.get('https://www.site-shot.com/screenshot/?width=1024&height=768&zoom=100&scaled_width=1024&full_size=&format=PNG&user_agent=&rnd=29814755364865&url=http%3A%2F%2Fschedule.npi-tu.ru%2Fschedule%2Ffitu%2F2%2F5m')
      .then(resp => {
        res.send('Success')
        axios.post(
          botApi + 'sendPhoto',
          {
            chat_id: 253527664,
            photo: `https://www.site-shot.com/cached_image/${resp.data.b64_uuid}`
          }
        ).then(resp => {
          console.log(resp)
          res.send('Success')
        })
        .catch(err => {
          console.log(err)
          res.send(err)
        })
      }).catch(err => {
        res.send(err)
      })
  } else {
    axios.post(
      botApi + 'sendPhoto',
      {
        chat_id: 253527664,
        photo: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/500/500`
      }
    ).then(res => {
      console.log(res)
      res.send('Success')
    })
    .catch(err => {
      console.log(err)
      res.send(err)
    })
  }
  console.log(req.body)
})

router.post('/alice', (req, res, next) => {
  console.log(req.body.request.command)
  res.send({
    "response": {
      "text": "Проверка прошла",
      "tts": "Похоже, работает",
      // "buttons": [
      //     {
      //         "title": "Надпись на кнопке",
      //         "payload": {},
      //         "url": "https://example.com/",
      //         "hide": true
      //     }
      // ],
      "end_session": false
    },
    "session": {
      "session_id": req.body.session.session_id,
      "message_id": req.body.session.message_id,
      "user_id": req.body.session.user_id,
    },
    "version": req.body.version
  })
})

module.exports = router;
