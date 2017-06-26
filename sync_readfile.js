var fs = require('fs');//모듈 호출

/**
Async Read File
**/
console.log('Async');
var data2 = fs.readFileSync('data.txt', {encoding:'utf8'});
console.log(data2);

/**
Sync Read File
**/
console.log('Sync');
var data = fs.readFile('data.txt', {encoding:'utf8'}, function(err,data){
	console.log('1-1');
	console.log(data);
});
console.log('1-2');
