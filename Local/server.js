//----------------------------------------------
//             SERVIDOR LOCAL
//----------------------------------------------


const PORTA_SERVER = 3000;

var express = require("express");
var app = express();
var router = express.Router();

router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

app.use("/",router);

app.use("*", function(req, res) {
  res.sendFile(path + "404.html");
});

app.listen(PORTA_SERVER, function() {
  console.log("Listening on http://localhost:" + PORTA_SERVER);
  main();
});

//----------------------------------------------
//               API REQUEST
//----------------------------------------------


// const REMOTE_SERVER_URL = "webcam-observer.herokuapp.com";
// const REMOTE_SERVER_PORT = 80;
const REMOTE_SERVER_URL = "localhost";
const REMOTE_SERVER_PORT = 5000;
const REMOTE_SERVER_GET_API_PATH = "/api";
const REMOTE_SERVER_POST_API_PATH = "/api2";


var http = require("http");
var cronJob = require("cron").CronJob;

var sensorOn = true;


function postJSON(post_data) {
  var str_data = JSON.stringify(post_data);

  var options = {
    host: REMOTE_SERVER_URL,
    port: REMOTE_SERVER_PORT,
    path: REMOTE_SERVER_POST_API_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Length': str_data.length
    },
  };

  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ', chunk);
    });
  });

  req.on('error', function(err) {
    console.log('Erro com POST JSON: ' + err.message);
  });

  req.write(str_data);
  req.end();
}

function getJSON(processApiResponse) {
  var options = {
    host: REMOTE_SERVER_URL,
    port: REMOTE_SERVER_PORT,
    path: '/api',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(options, function(res) {
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
     output += chunk;
   });

    res.on('end', function() {
      var obj = JSON.parse(output);
      processApiResponse(res.statusCode, obj);
    });
  });

  req.on('error', function(err) {
    console.log('Erro com GET JSON: '+ err.message);
  });

  req.end();
};


function processApiResponse(statusCode, jsonObj) {
  console.log(jsonObj);

  if (jsonObj.takePicture) {
    takePictureAndSend();
  }

  if (jsonObj.sensorOn != sensorOn) {
    sensorOn = jsonObj.sensorOn;
    if (sensorOn) {
      serial.send(SERIAL_COM_SENSOR_ON);
    } else {
      serial.send(SERIAL_COM_SENSOR_OFF);
    }
  }
}


// Executa getJSON de 1 em 1 segundo
function startCronJob() {
  new cronJob("* * * * * *", function() {
    getJSON(processApiResponse);
    //postJSON
  }, null, true);
}


//----------------------------------------------
//                  WEBCAM
//----------------------------------------------

var NodeWebcam = require("node-webcam");
var fs = require('fs');
var imgurUploader = require('imgur-uploader');

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


function takePictureAndSend() {
  var date = new Date();
  var str_date = date.getDate() + "_" + date.getMonth() + "_" + date.getYear() + "_" + date.getHours() + "_" +  date.getMinutes() + "_" + date.getSeconds();

  var filename = "my_picture-" + str_date;
  Webcam.capture(filename, function(err) {
    if (!err) {
      console.log("Imagem "+filename+".jpg criada.");
      uploadAndSend(filename, str_date)
    }
  });

  //setTimeout(function() {uploadAndSend(filename, str_date)}, 4500);
}

function uploadAndSend(filename, str_date) {

	imgurUploader(fs.readFileSync(filename+".jpg"), {title: filename}).then(data => {
	  var img_data = {
	    img_link: data.link,
	    img_date: str_date
	  }

	  postJSON({"img_data": img_data});
	  /*
	  {
	    id: 'OB74hEa',
	    link: 'http://i.imgur.com/jbhDywa.jpg',
	    title: 'Hello!',
	    date: Sun May 24 2015 00:02:41 GMT+0200 (CEST),
	    type: 'image/jpg',
	    ...
	  }
	  */
	});
}



//----------------------------------------------
//               SERIAL ARDUINO
//----------------------------------------------

const SERIAL_COM_SENSOR_ON = "S_ON";
const SERIAL_COM_SENSOR_OFF = "S_OFF";
const SERIAL_COM_SENSOR_DISPARADO = "S_DISP";
const SERIAL_COM_ARDUINO_CONECTADO = "ARDUINO_ON";

var SerialPort = require("serialport");

function Serial(port) {
  var mySerialPort = new SerialPort(port, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline("\n")
  });
  
  mySerialPort.on("open", function() {
    console.log("Porta serial " + port + " aberta.");
  });
  
  mySerialPort.on("data", function(data) {
    if (data === SERIAL_COM_SENSOR_DISPARADO) {
      console.log("Sensor disparado!");
      takePictureAndSend();
    } else if (data === SERIAL_COM_ARDUINO_CONECTADO) {
      console.log("Arduino conectado!");
      postJSON({"arduinoOn": true});
    }

  });
  
  mySerialPort.on('error', function(error) {
    console.log(error);
  });
  
  this.send = function(data) {
    mySerialPort.write(data);
  }
}

var serial = null;

//----------------------------------------------
//                    MAIN
//----------------------------------------------

const readline = require('readline');

function main() {
  SerialPort.list(function (err, ports) {
    console.log("\nLista de portas seriais: ");

    ports.forEach(function(port) {
      console.log("  %s - %s ", port.comName, port.manufacturer);
    });

    var rl = readline.createInterface(process.stdin, process.stdout);

    rl.question('\nDigite o nome da porta serial que o Arduino está conectado >> ', function(input) {
      console.log(input);
      serial = new Serial(input);
      rl.close();
      startCronJob();
    });
  }); 
}

