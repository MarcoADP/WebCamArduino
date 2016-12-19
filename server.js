//----------------------------------------------
//                  SERVIDOR
//----------------------------------------------

const PORTA_SERVER = 3000;

var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

app.set('view engine', 'pug')
app.use('/public', express.static('public'));

router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

router.get("/", function(req, res){
  res.render('index', { title: 'Hey', message: 'Hello there!'})
});

router.get("/about", function(req, res){
  res.render('about')
});

app.use("/",router);

app.use("*", function(req, res) {
  res.sendFile(path + "404.html");
});

app.listen(PORTA_SERVER, function() {
  console.log("Listening on http://localhost:" + PORTA_SERVER);
});


//----------------------------------------------
//               SERIAL ARDUINO
//----------------------------------------------

const PORTA_SERIAL_ARDUINO = "COM1"

var SerialPort = require("serialport");

var mySerialPort = new SerialPort(PORTA_SERIAL_ARDUINO, {
  baudrate: 9600,
  parser: SerialPort.parsers.readline("\n")
});

mySerialPort.on("open", function() {
    console.log("Porta serial " + PORTA_SERIAL_ARDUINO + " aberta.");
});

mySerialPort.on("data", function(data) {
  console.log('Recebeu: ' + data);
  /*io.emit('serialData', {
    dado: parseFloat(data)
  });*/
});

mySerialPort.on('error', function(error) {
  console.log(error);
});
