const express = require('express');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const kural = require('../kuralmodel/kuralmodel');
const user = require('../usermodel/usermodel');
const kuralversion = require('../kural_version/kuralversionmodel');
const AWS = require('aws-sdk');

let awsconfig = {
  "region": "ap-south-1",
  "endpoint": "http://dynamodb.ap-south-1.amazonaws.com",
  "accessKeyId": process.env.ACCESSKEYID,
  "secretAccessKey": process.env.SECRETACCESSKEY
}

AWS.config.update(awsconfig);




router.post('/getkuralversion', (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
    if (err) return res.sendStatus(401)

    kuralversion.find({
    }, (err, docs) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        if (docs.length === 0) {
          return res.status(200).send("NA");
        } else {
          return res.status(200).send(docs);
        }
      }
    });
  });

});



router.post('/getkuraldata', (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
    if (err) return res.sendStatus(401)


    var params = {
      TableName: "kuraldata",
      ProjectionExpression: ["Paagam", "PaagamNo"]
    };
    let docClient = new AWS.DynamoDB.DocumentClient();

    docClient.scan(params, (err, data) => {
      if (err) { res.status(404) }
      else {
        var result = data.Items.reduce((unique, o) => {
          if (!unique.some(obj => obj.Paagam === o.Paagam && obj.PaagamNo === o.PaagamNo)) {
            unique.push(o);
          }
          return unique.sort((a, b) => (a.PaagamNo > b.PaagamNo) ? 1 : ((b.PaagamNo > a.PaagamNo) ? -1 : 0));
        }, []);
        res.status(200).send(result);
      }
    });


    //   kural.aggregate([{ $group: { _id: '$Paagam', 'PaagamNo': { '$max': '$PaagamNo' } } }, { $sort: { 'PaagamNo': 1 } }]).exec(function (error, data) {
    //     if (error) res.status(401);
    //     res.status(200).send(data);
    //     // ids is an array of all ObjectIds
    //   });
  });


});

router.post('/getkural', (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
    if (err) return res.sendStatus(401)



    kural.aggregate([{ $match: { "SubSectionNo": req.body.subsectionno } }, { $group: { _id: { 'Paagam': '$Paagam', 'Section': '$Section', 'SubSection': '$SubSection', 'SubSectionNo': '$SubSectionNo' } } }, { $sort: { 'PaagamNo': 1 } }]).exec(function (error, data) {
      if (error) res.status(401);
      res.status(200).send(data);
      // ids is an array of all ObjectIds
    });
  });


});

router.post('/getkuralsection', (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
    if (err) return res.sendStatus(401)
    value = [];
    var paagamno = req.body.paagamno;
    var params = {
      TableName: "kuraldata",
      ProjectionExpression: ["#Section", "SectionNo"],
      FilterExpression: "#paagamno = :paagamno",
      ExpressionAttributeNames: {
        "#Section": "Section",
        '#paagamno': "PaagamNo"
      },
      ExpressionAttributeValues: {
        ":paagamno": paagamno
      }
    };
    let docClient = new AWS.DynamoDB.DocumentClient();

    docClient.scan(params, onScan);
    var count = 0;
    


    // kural.aggregate([{ $match: { "Paagam": req.body.paagam } }, { $group: { _id: '$Section', 'SectionNo': { '$max': '$SectionNo' } } }, { $sort: { 'SectionNo': 1 } }]).exec(function (error, data) {
    //   if (error) res.status(401);
    //   res.status(200).send(data);
    //   // ids is an array of all ObjectIds
    // });

    function onScan(err, data) {
      if (err) {
        res.sendStatus(401);
      } else {
        // print all the movies
        // console.log("Scan succeeded.");
        data.Items.forEach(function (val) {
          value.push({
            "Section": val.Section,
            "SectionNo": val.SectionNo
          })
        });

        // continue scanning if we have more movies
        if (typeof data.LastEvaluatedKey != "undefined") {
          // console.log("Scanning for more...");
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
        else
        {
          var result = value.reduce((unique, o) => {
            if (!unique.some(obj => obj.Section === o.Section && obj.SectionNo === o.SectionNo)) {
              unique.push(o);
            }
            return unique.sort((a, b) => (a.SectionNo > b.SectionNo) ? 1 : ((b.SectionNo > a.SectionNo) ? -1 : 0));
          }, []);
          res.status(200).send(result);
        }
      }
    }
  });


});





router.post('/getkuralsubsection', (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
    if (err) return res.sendStatus(401)
    value = [];
    var sectionno = req.body.sectionno;
    var params = {
      TableName: "kuraldata",
      ProjectionExpression: ["#SubSection", "SubSectionNo"],
      FilterExpression: "#SectionNo = :sectionno",
      ExpressionAttributeNames: {
        "#SubSection": "SubSection",
        '#SectionNo': "SectionNo"
      },
      ExpressionAttributeValues: {
        ":sectionno": sectionno
      }
    };
    let docClient = new AWS.DynamoDB.DocumentClient();

    docClient.scan(params, onScan);
    var count = 0;
    


    // kural.aggregate([{ $match: { "Paagam": req.body.paagam } }, { $group: { _id: '$Section', 'SectionNo': { '$max': '$SectionNo' } } }, { $sort: { 'SectionNo': 1 } }]).exec(function (error, data) {
    //   if (error) res.status(401);
    //   res.status(200).send(data);
    //   // ids is an array of all ObjectIds
    // });

    function onScan(err, data) {
      if (err) {
        res.sendStatus(401);
      } else {
        // print all the movies
        // console.log("Scan succeeded.");
        data.Items.forEach(function (val) {
          value.push({
            "SubSection": val.SubSection,
            "SubSectionNo": val.SubSectionNo
          })
        });

        // continue scanning if we have more movies
        if (typeof data.LastEvaluatedKey != "undefined") {
          // console.log("Scanning for more...");
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        }
        else
        {
          var result = value.reduce((unique, o) => {
            if (!unique.some(obj => obj.SubSection === o.SubSection && obj.SubSectionNo === o.SubSectionNo)) {
              unique.push(o);
            }
            return unique.sort((a, b) => (a.SubSectionNo > b.SubSectionNo) ? 1 : ((b.SubSectionNo > a.SubSectionNo) ? -1 : 0));
          }, []);
          res.status(200).send(result);
        }
      }
    }

    // kural.aggregate([{ $match: { "Paagam": req.body.paagam, "Section": req.body.section } }, { $group: { _id: '$SubSection', 'SubSectionNo': { '$max': '$SubSectionNo' } } }, { $sort: { 'SubSectionNo': 1 } }]).exec(function (error, data) {
    //   if (error) res.status(401);
    //   res.status(200).send(data);
    //   // ids is an array of all ObjectIds
    // });
  });


});

router.post('/getkuralcontent', (req, res) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
    if (err) return res.sendStatus(401)
    kural.aggregate([{ $match: { "Paagam": req.body.paagam, "Section": req.body.section, "SubSection": req.body.subsection } }, { $group: { _id: '$Content' } }, { $sort: { '_id': 1 } }]).exec(function (error, data) {
      if (error) res.status(401);
      res.status(200).send(data);
      // ids is an array of all ObjectIds
    });
  });


});

module.exports = router;