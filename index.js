var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var obj = JSON.parse(fs.readFileSync('priv/db.json','utf8'));

function replaceAll(strIn, replaceVal, wVal){

    var out = strIn.replace(replaceVal,wVal);
    while(out.indexOf(replaceVal) >= 0){
        out = out.replace(replaceVal,wVal);
    }
    return out;
}

var con = mysql.createConnection({
    host: obj.host,
    user: obj.userName,
    password: obj.password,
    database: obj.database
});

con.connect(function(err) {
    if(err){
        console.log("Error connecting to database");   
    }
    else{
        console.log("Database connected");
    }
});

server = http.createServer( function(req,res) {

    if(req.method == 'POST'){
        var body = "";
        var name_tag = "sender_name";
        var name = "";
        var message = "";
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        req.on('end', function () {
            console.log("Body: " + body);
            name = replaceAll(body.substring(body.indexOf(name_tag) + name_tag.length + 1).split('&')[0],"+"," ");
            message = replaceAll(body.substring(body.indexOf("message") + 8).split('&')[0],"+"," ");
            con.query("INSERT INTO messages(user_id,message) VALUES('" + name + "','" + message + "');",function(err,rows,fields){
                if(err){
                    console.log("Error adding message to messages db");                    
                }
                else{
                    console.log("Message added to database successfully");
                }
            });
            res.end('post received\nMessage: ' + message + '\n Sender: ' + name);
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
    }
    else{
        var body = '';
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        req.on('end', function () {
            console.log("Body: " + body);
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');

    }
}).listen(8081,'192.168.1.3');


port = 8081;
host = obj.host;
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
