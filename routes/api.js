var express = require('express');
var mysql = require("mysql");
var databaseInfo = require('./database');
var connection = databaseInfo[0];
var signature = databaseInfo[1];
var router = express.Router();

router.post("/upload", function (req, res) {
    var req_sign = req.headers.signature;
    if (req_sign == signature) {
        var data = req.body;
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var item = {
            date: date,
            value: data.value,
            lat: data.lat,
            long: data.long
        }
        connection.query("INSERT INTO data SET ?", item, function (err, result) {
            if (!err) res.status(200).send("Data succesfully uploaded");
            else res.status(100).send("Error in database");
        });
    }
    else res.status(401).send("Wrong signature");
});

module.exports = router;