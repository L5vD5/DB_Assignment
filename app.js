//Entry App
//Main App
//Author : L5vD5

const express = require('express');
const fs = require('fs');

var app = express();
//post 통신을 위한 body parser!!
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : false}));
//jade!!
app.set('view engine', 'jade');
app.set('views', './views');

//static!!
app.use(express.static('public'));

/*********
Form으로 접속
*********/
app.get('/form', function(req,res){
	res.render('form');
});

app.post('/form_receiver', function(req,res){
	var title = req.body.title;
	var description = req.body.description;
	res.send(title+" : "+description);
});
/*********
Template으로 접속
*********/
app.get('/template', function(req,res){
	res.render('temp', {title : 'Wow nodejs',time : Date()});
});
/*********
Topic으로 접속
*********/
app.get('/topic/:id', function(req,res){
	var topics = [
    'Javascript is....',
    'Nodejs is...',
    'Express is...'
  ];
  var output = `
  <a href="/topic/0">JavaScript</a><br>
  <a href="/topic/1">Nodejs</a><br>
  <a href="/topic/2">Express</a><br><br>
  ${topics[req.params.id]}
  `
	res.send(output + req.params.id);
});
/*********
Home으로 접속
*********/
app.get('/', function(req,res){
	//res.send("Hello Home Page");
	console.log('req:' + req.url);
	res.writeHead(302, {"Location" : "/login"});
	res.end();
});

/**
login으로 접속
**/
app.get('/login', function(req,res){
	//res.send("<h1>Login Please</h1>");
	res.render('login', {});
});

/**
login_auth에서 계정 유효성 확인
**/


app.listen(2000, function(){
	console.log('2000 포트가 열렸습니다.');
});
