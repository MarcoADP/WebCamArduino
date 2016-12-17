
var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

app.set('view engine', 'pug')
app.use('/public', express.static('public'));

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/", function(req,res){
  res.render('index', { title: 'Hey', message: 'Hello there!'})
});

router.get("/about", function(req,res){
  res.render('about', { title: 'Hey', message: 'Hello there!'})
});

app.use("/",router);

app.use("*", function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000, function(){
  console.log("Listening on http://localhost:3000");
});
