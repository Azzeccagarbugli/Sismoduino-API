var express = require('express');
var util = require('util');
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

router.get("/download", function (req, res) {
    //Determine SQL query according to options
    var query = "SELECT * FROM data WHERE";
    try {
        var options = req.query;
        if(options.min) query += util.format(" value >= %s AND", options.min);
        if(options.max) query += util.format(" value <= %s AND", options.max);        
        query += ";"; //Add closing semicolon
        //Check if there is an "AND" at the end of the query and remove it
        query = query.replace("AND;", ';').replace("WHERE;", ';');
    } catch (ex) {
        res.status(401).send("Bad parameters");
        return;
    }

    connection.query(query, function (err, rows, fields) {
        if (!err)
            res.send(rows);
        else res.status(500).send("Database error");
    });
});

module.exports = router;