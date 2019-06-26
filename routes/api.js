var express = require('express');
var router = express.Router();

router.post('/netlify', (req, res, next) => {
  res.send(JSON.stringify(req.body))
})

module.exports = router;
