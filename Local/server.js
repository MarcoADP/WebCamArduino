//----------------------------------------------
//                  SERVIDOR
//----------------------------------------------

var http = require("http");
var cronJob = require("cron").CronJob;

const PORTA_SERVER = 3001;

var express = require("express");
var app = express();
var router = express.Router();

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

router.post('/ligaDesliga', function(req, res, next) {
  NodeWebcam.capture( "my_picture", {}, function() {
    console.log( "Image created!" );
  });
});


app.use("/",router);

app.use("*", function(req, res) {
  res.sendFile(path + "404.html");
});

app.listen(PORTA_SERVER, function() {
  console.log("Listening on http://localhost:" + PORTA_SERVER);
});


var options = {
    host: 'localhost',
    port: 3000,
    path: '/api',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getJSON(options) {
    console.log("rest::getJSON");

    var req = http.request(options, function(res) {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
        	console.log("DATA");
            output += chunk;
        });

        res.on('end', function() {
        	console.log("END");
            var obj = JSON.parse(output);
            console.log("OBJETO:");
            console.log(obj)
            //onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        console.log('error: '+ err.message);
    });

    req.end();
};


// Run this cron job every Sunday (0) at 7:00:00 AM
new cronJob("* * * * * *", function() {
    getJSON(options);
}, null, true);


//----------------------------------------------
//                  WEBCAM
//----------------------------------------------

var NodeWebcam = require( "node-webcam" );

//Default options 

var opts = {

  width: 1280,

  height: 720,

  delay: 0,

  quality: 100,

  output: "jpeg",

  verbose: true

}

var Webcam = NodeWebcam.create(opts); 


//----------------------------------------------
//               SERIAL ARDUINO
//----------------------------------------------

// const PORTA_SERIAL_ARDUINO = "COM4"

// var SerialPort = require("serialport");

// var mySerialPort = new SerialPort(PORTA_SERIAL_ARDUINO, {
//   baudrate: 9600,
//   parser: SerialPort.parsers.readline("\n")
// });

// mySerialPort.on("open", function() {
//   console.log("Porta serial " + PORTA_SERIAL_ARDUINO + " aberta.");
// });

// mySerialPort.on("data", function(data) {
//   console.log('Recebeu: ' + data);
//   if (data == "TP") {
//     d = new Date();
//     Webcam.capture( "my_picture-" + d.getDate() + "_" + d.getMonth() + "_" + d.getYear() + "_" + d.getHours() + "_" +  d.getMinutes() + "_" + d.getSeconds());
//     console.log( "Imagem criada!" );
//   } 
//   /*io.emit('serialData', {
//     dado: parseFloat(data)
//   });*/
// });

// mySerialPort.on('error', function(error) {
//   console.log(error);
// });
