const express = require('express');
const app = express();
const topic = require('./topic.js');

topic.init(app);

console.log(topic.a);

app.listen(3000, function()
{
  console.log('Connected, 3000 port!');
});
