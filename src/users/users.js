const express = require('express');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const user = require('../usermodel/usermodel');
var AWS = require('aws-sdk');

router.post('/getuser', (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) return res.sendStatus(401)
        user.findOne({
            phonenumber: req.body.phonenumber,
        }).then((doc) => {
            if (!doc) {
                res.status(200).send('NA');
            } else {
                res.status(200).send('A');
            }
        });

    })

});

router.post('/adduser', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) return res.sendStatus(401)
        var array = [{
            "fullname": req.body.fullname,
            "email": req.body.email,
            "phonenumber": req.body.phonenumber
        }];
        user.create(
            array
        ).then((docs) => {
            if (docs) {
                res.status(200).send("OK");
            }
            else {
                res.status(200).send("NA");
            }
        });
    });

});

router.post('/addfav', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) return res.sendStatus(401)

        user.updateOne({
            "phonenumber": req.body.phonenumber
        }, {
            "$push": {
                "favorites": req.body.subsectionno
            }
        }, (err) => {
            if (err) {
                console.log(`Error: ` + err)
            }
            res.status(200).send("OK");
        });


    });

});

router.post('/generateOTP', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) return res.sendStatus(401)

        var params = {
            Message: req.body.message,
            PhoneNumber: '+' + req.body.number,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    'DataType': 'String',
                    'StringValue': req.body.subject
                }
            }
        };

        var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

        publishTextPromise.then(
            function (data) {
                res.status(200).send("OK");
            }).catch(
                function (err) {
                    res.status(404)
                });
    });

});

router.post('/deletefav', (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) return res.sendStatus(401)
        user.updateOne({
            "phonenumber": req.body.phonenumber
        }, {
            "$pull": {
                "favorites": req.body.subsectionno
            }
        }, (err) => {
            if (err) {
                console.log(`Error: ` + err)
            }
            res.status(200).send("OK");
        });
        // ids is an array of all ObjectIds
    });
});

router.post('/getfav', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) return res.sendStatus(401)

        user.findOne({
            phonenumber: req.body.phonenumber,
        }).then((doc) => {
            if (!doc) {
                res.status(200).send("NA")
            } else {
                res.status(200).send(doc);
            }
        });


    });

});




module.exports = router;