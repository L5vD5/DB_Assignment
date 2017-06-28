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

//user 로그인 세션
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;//Mysql 전략

//team 서비스 세션
const passport2 = require('passport');
const LocalStrategy = require('passport-local').Strategy;//Mysql 전략

//project 서비스 세션

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  port     : '3306',
  database : 'db',
  multipleStatements : true
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
connection.connect();
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
	if(req.user)//로그이 돼있으면 바로 /home으로 감
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
  res.end();
});

/**
home에서 서비스 시작
**/

app.get('/home', function(req,res){
  connection.query('SELECT * FROM post', function(err, rows, fields){
    if(!err)
    {
      res.render('home', {id : req.user.id, money : req.user.money, posts : rows});
    }
    else {
      console.log('Error while performing Query.', err);
    }
  });
  //res.end();
});

/**
write에서 글 쓰기
**/

app.get('/write', function(req,res){
  res.render('write', {id : req.user.id});
});
app.post('/write', function(req,res){
  connection.query('INSERT INTO post (post_content, name) VALUES ("'+req.body.content+'", "'+req.user.id+'")', function(err, rows, fields) {
    if (!err)
    {
      console.log(rows.insertId);
    }
    else
      console.log('Error while performing Query.', err);
  });
  res.redirect('/home');
});

/**
Delete에서 글 지우기
**/
app.get('/delete/:num', function(req,res)
{
  connection.query('DELETE FROM post where post_no="'+req.params.num+'"',function(err, rows, fields){
    if(!err)
    {
      console.log("DELETE SUCCESS");
    }
    else {
      console.log('Error while performing Query.', err);
    }
  });
  res.redirect('/home');
});

/**
view에서 team과 project 보이기
**/
app.get('/view/team', function(req, res)
{
  connection.query('SELECT * FROM team;'+'SELECT * FROM team WHERE id = "'+req.user.id+'";', function(err, rows, fields){

    if(!err)
    {
      res.render('team_view', {id :req.user.id, teams : rows[0], myteam : rows[1]});
    }
    else {
      console.log('Error while performing Query.', err);
    }
  });

})

app.get('/team_make', function(req,res)
{
  res.render('team_make');
})

app.post('/team_make', function(req,res)
{
  connection.query('INSERT INTO team (name, id, user_no) VALUES ("'+req.body.name+'", "'+req.user.id+'", "'+req.user.user_no+'")', function(err, rows, fields) {
    if (!err)
    {
      console.log(rows.insertId);
    }
    else
      console.log('Error while performing Query.', err);
  });
  res.redirect('/view/team');
})
/**
recharge에서 충전
**/
app.get('/recharge', function(req,res){
  res.render('recharge')
})

app.post('/recharge', function(req,res){
  connection.query('UPDATE user set money="'+(req.user.money+1000)+'" where id="'+req.user.id+'"', function(err, rows, fields){
    if(!err)
    {
      console.log("recharge Success");
    }
    else
      console.log('Error while performing Query.', err);
  })
  res.redirect('/home');
})
/**
sponse에서 후원
**/
app.get('/sponse/:team_name', function(req,res)
{
  connection.query('UPDATE user set money=money-1000" where id="'+req.user.id+'";'
                    +'UPDATE team set Money= Money+1000 where name="'+req.params.team_name+'";', function(err,rows,fields){
    if(!err)
    {
      console.log("sponse Success");
    }
    else
      console.log('Error while performing Query.', err);
  })
  res.redirect('/view/team');
})
}
