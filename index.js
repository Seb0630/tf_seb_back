var express = require('express');  
var http = require('http');
var https = require('https');

http.globalAgent.maxSockets = 100;
https.globalAgent.maxSockets = 100;

var cors = require('cors'); // CORS
mongoose = require('mongoose'); // driver for mongodb access

require('dotenv').config(); // package for env variables setting

const Router = require("./routes")
const app = express();
app.use(express.json());

app.use(cors()); // CORS solved - cross origin resource sharing - this is needed to access between different APIs
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = process.env.PORT || 4000; // this variable is set in .env file
const mongo_uri = process.env.MONGO_URI; // this variable is set in .env file
// Connect to the database
mongoose.connect(
  mongo_uri
);

const db = mongoose.connection; // mongoose connection instance
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", async function () {
  console.log("Connected successfully");
  await app.use('/', Router);
});

app.listen(port, () => {
  console.log("Server is running at port 4000");
});