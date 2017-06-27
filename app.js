//Entry App
//Main App
//Author : L5vD5

const express = require('express');
const route = require('./route.js');
const app = express();

route.init(app);

//static!!
app.use(express.static('public'));
app.listen(2000, function(){
	console.log('2000 포트가 열렸습니다.');
});
