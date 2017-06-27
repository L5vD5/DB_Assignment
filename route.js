exports.init= function(app)
{

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const MySQLStore = require('express-mysql-session')(session);

//post 통신을 위한 body parser!!
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
//jade!!
app.set('view engine', 'jade');
app.set('views', './views');

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;//Mysql 전략


var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  port     : '3306',
  database : 'db'
});

app.use(session({//세션
  key: 'logged',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'123456',
    database:'db'
  })
}))
app.use(passport.initialize());
app.use(passport.session());

/*********
/으로 접속
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
	if(req.user)
  {
    res.redirect('/home');
  }
	res.render('login', {});
});
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  connection.query('SELECT * FROM user WHERE id= "'+id+'"', function(err,results){
    if(err){
      done('There is no user');
    }
    else{
      done(null, results[0]);
    }
  });
});
/**
login_auth에서 계정 유효성 확인
**/
passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    connection.query('SELECT * FROM user WHERE id = "'+uname+'"', function(err, results){
      if(err){
        return done('There is no user.');
      }
      else{
        var user = results[0];
        if(user.password === pwd)
        {
          done(null, user);
        }
        else {
          done(null, false);
        }
      }
    })
}));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/home',
                                   failureRedirect: '/login',
                                   failureFlash: false }));

app.get('/logout', function(req, res)
{
  req.logout();
  req.session.save(function(){
    res.redirect('/login');
  })

})
/**
signin에서 계정 생성
**/
app.get('/signin', function(req,res){
  res.render('signin', {});
  res.end();
});

/**
signin_auth에서 계정 생성 sql 실행
**/


app.post('/signin_auth', function(req,res){
  connection.connect();
  if(req.body.password == req.body.password_conf)//비밀번호가 일치한 경우
  {
    connection.query('INSERT INTO user (id, password, name) VALUES ("'+req.body.id+'", "'+req.body.password+'", "'+req.body.name+'")', function(err, rows, fields) {
      if (!err)
      {
        console.log(rows.insertId);
      }

      else
        console.log('Error while performing Query.', err);
    });

    res.redirect('/login');
  }
  else {//비밀번호가 일치하지 않은 경우
    res.redirect('/signin');
  }
  connection.end();
  res.end();
});

/**
home에서 서비스 시작
**/
app.get('/home', function(req,res){
  res.render('home',{id : req.user.id});
  res.end();
});
}
