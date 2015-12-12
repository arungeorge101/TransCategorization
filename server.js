
// How to return http response back to clients
//***************************************************************
// var http = require('http');

// http.createServer(function (req, res) {
// res.writeHead(200, {'Content-Type': 'text/plain'});
// res.end('Hello World\n');
// }).listen(process.env.PORT, process.env.IP);

// console.log('Server running!');
//***************************************************************

//How to use Express to route requests
//***************************************************************
var express = require('express');

var gettransaction = require("./routes/gettransaction");

var app = express();


//todo - add a general method to return the 
app.get('/transactions', gettransaction.findAll);

app.get('/originalTransactions/:id', gettransaction.findById);

app.patch('/transactions/:id', gettransaction.updateTran);

app.get('/transactions/:id', gettransaction.findtrancategory);

app.get('/siccode/:id', gettransaction.findSICCode);

app.listen(process.env.PORT, process.env.IP);

console.log("express app is listening")
//***************************************************************