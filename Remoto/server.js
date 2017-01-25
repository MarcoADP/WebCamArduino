//----------------------------------------------
//             SERVIDOR REMOTO
//----------------------------------------------

const PORTA_SERVER = 8080;

var express = require("express");
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

app.set('view engine', 'pug')
app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

app.use(bodyParser.json())

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = err;
  if (msg) res.locals.message = msg;
  next();
});


var arduinoOn = false;
var sensorOn = true;
var takePicture = false;

var pushNotification = false;

var images_info = {
  "links": [],
  "dates": []
}

router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

router.get('/', function(req, res){
  if (req.session.user) {
    res.redirect('/index');
  } else {
    res.redirect('/login');
  }
});

router.get("/index", restrict, function(req, res){
  res.render('index', {sensorOn: sensorOn, user: adminUser, pushNotification: pushNotification})
});

router.get("/about", restrict, function(req, res){
  res.render('about', {sensorOn: sensorOn, user: adminUser, pushNotification: pushNotification})
});

router.get("/images", restrict, function(req, res){
  res.render('images', {sensorOn: sensorOn, user: adminUser, pushNotification: pushNotification, images_info: images_info})
});

router.post('/sensor', function(req, res, next) {
  sensorOn = !sensorOn;
  res.redirect('/')
});

router.post('/takePicture', function(req, res, next) {
  takePicture = true;
  res.redirect('/')
});

router.post('/api2', function(req, res, next) {
  console.log(JSON.stringify(req.body));
  processJSON(req.body);
  res.redirect('/')
});

router.get('/api', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ "sensorOn": sensorOn,  "takePicture": takePicture}));

  takePicture = false;
});


app.use("/",router);

app.use("*", function(req, res) {
  res.sendFile(path + "404.html");
});

app.listen(PORTA_SERVER, function() {
  console.log("Listening on http://localhost:" + PORTA_SERVER);
});


function processJSON(json_data) {
  if ("img_data" in json_data) {
    images_info.links.push(json_data.img_data.img_link);
    images_info.dates.push(json_data.img_data.img_date);
  }

  if ("arduinoOn" in json_data) {
    console.log("ARDUINO ONNNNNNNNNNNNNNNN");
    arduinoOn = json_data.arduinoOn;
  }
}


//----------------------------------------------
//                   LOGIN
//----------------------------------------------

function User(username, password, realname) {
  this.username = username;
  this.password = password;
  this.realname = realname;
}

function autenticar(username, password, user) {
  return user.username === username && user.password === password;
}

var adminUser = new User('admin', 'admin', 'Admin');



function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Acesso negado!';
    res.redirect('/login');
  }
}

router.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;

  if (autenticar(username, password, adminUser)) {
    req.session.regenerate(function(){
      req.session.user = username;
      req.session.success = 'Autenticado como ' + username + '.';
      res.redirect('/index');
    });
  } else {
    req.session.error = 'Usuário ou senha incorretos.';
    res.redirect('/login');
  }
});