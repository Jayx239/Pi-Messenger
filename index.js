var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var obj = json.parse(fs.readFileSync('db.config','utf8'));

var con = mysql.createConnection({
    host: obj.host,
    user: obj.userName,
    password: obj.password,
    database: obj.database
});


