var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var obj = JSON.parse(fs.readFileSync('priv/db.json','utf8'));
var home = fs.readFileSync("../../index.html",'utf8');
var DEBUG = false;

function logDebug(msg){
    if(DEBUG){
        console.log(msg);
    }
}

function replaceAll(strIn, replaceVal, wVal){

    var out = strIn.replace(replaceVal,wVal);
    while(out.indexOf(replaceVal) >= 0){
        out = out.replace(replaceVal,wVal);
    }
    return out;
}

function packageMessages(rows){
        response = "{ \"messages\": [";
        var comma = "";
        for(var i=0; i<rows.length; i++){
            var nextMessage = "";
            nextMessage += comma + "{ \"timeStamp\": \"" + rows[i].time_stamp + "\", \"userId\": \"" + replaceAll(rows[i].user_id,"\""," ") + "\", \"message\": \"" + replaceAll(rows[i].message,"\""," ") + "\" }";
            response+=nextMessage;
            comma=",";
        }
        response +="]}";
        return response;
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
            res.writeHead(302, {
                'Location': '../../index.html'      
            });
            res.end();
        });
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

        con.query("SELECT * FROM messages;",function(err,rows,fields){
            if(err){
                console.log("Error retrieving data");
                response = "Error";
                res.writeHead(200, {'Content-Type': 'application/json'});
                var messages = packageMessages("");
                logDebug(messages);
                res.end(messages);
            }
            else{
                console.log("Messages retrieved from database successfully");
                var messages = packageMessages(rows);
                res.writeHead(200, {'Content-Type': 'application/json'});
                var messages = packageMessages(rows);
                logDebug(messages);
                res.end(messages);
            }
        });

    }
}).listen(8081,'192.168.1.3');

port = 8081;
host = obj.host;
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
