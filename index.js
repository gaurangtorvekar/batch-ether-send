var sleep = require('sleep');
var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var fs = require('fs'); 
var parse = require('csv-parse');
var path = require('path');

var _to = [];
var _value = [];

module.exports = function(){
    var fullFileName = process.argv.slice(2)[0];
    console.log("========= File name = ", fullFileName)
    fs.createReadStream(path.resolve(process.cwd(), fullFileName))
        .pipe(parse({
            delimiter: ','
        }))
        .on('data', function(csvrow) {
            _to.push(csvrow[0]);
            _value.push(csvrow[1] * 1000000000000000000);
        })
        .on('end', function() {
            console.log(_to);
            console.log(_value);
            _to = [];
            _value = [];
        });
}
