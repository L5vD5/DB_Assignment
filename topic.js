exports.init = function(app)
{
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(bodyParser.urlencoded({extended : false}));

app.set('views', './views_file');
app.set('view engine', 'jade');


app.get('/topic/new', function(req,res)
{
  fs.readdir('data', function(err, files){//callback
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('new',{topics : files});
  })
});
app.post('/topic', function(req,res){
  var title = req.body.title;
  var description = req.body.description;
  fs.writeFile('data/'+title, description, function(err)
  {
    if(err){
      res.status(500).send('Internal Server Error');
      console.log(err);
    }
  res.redirect('/topic/'+title);
  });
})

app.get(["/topic","/topic/:title"], function(req,res){
  fs.readdir('data', function(err, files){//callback
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    var title = req.params.title;
    if(title)//id 값이 있을 때
    {
      fs.readFile('data/'+title, 'utf8', function(err,data){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        res.render('view', {title : title , description : data , topics : files});
      })
    }
    else//id 값이 없을 때
      res.render('view', {topics : files, title : 'Welcome', description : 'Hello, Javascript Developers'});
  })

})
}
