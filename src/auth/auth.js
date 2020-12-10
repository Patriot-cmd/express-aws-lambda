const express = require('express');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');


router.post('/authtoken',(req,res) => {

  // const id = req.body.id;
  const appid = req.body.appid

  if(process.env.APPID == appid)
  {
    var signOptions = {
      expiresIn: "1h",
      algorithm: "RS256"
    };

    var payload = {
      uniqueid: req.body.id,
    }
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "10m"})

    res.json({accessToken: accessToken})
  }
  else
  {
      res.sendStatus('401');
  }

  
});

module.exports = router;
