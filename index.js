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
            const rainmaker_abi = [ { "constant": false, "inputs": [ { "name": "_to", "type": "address[]" }, { "name": "_value", "type": "uint256[]" } ], "name": "letItRain", "outputs": [ { "name": "_success", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "previousOwner", "type": "address" } ], "name": "OwnershipRenounced", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" } ]
            var web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
            var nonce = web3.eth.getTransactionCount('0xda8107332d3edC065753d23fe23a42a308Ac8879');
            console.log("========= Nonce found = ", nonce);

            var address_rainmaker = '0xD097605b320F20b2047CfCCBdF764A3D1818BD7d';
    
            var RainmakerContract = web3.eth.contract(rainmaker_abi);
            var Rainmaker_instance = RainmakerContract.at(address_rainmaker);
            // nonce += 1;
            console.log("======== Nonce while sending transaction = ", nonce);

            try {
                console.log(_to);
                console.log(_value);
                var rainmaker_call_data = Rainmaker_instance.letItRain.getData(_to, _value);
                // console.log("Call data = ", indorser_call_data);    
            } catch (e) {
                console.log(e);
            }

            var privateKey = new Buffer(process.env.token_priv_key, 'hex');

            nonceHex = web3.toHex(nonce);
            var gasLimit = web3.toHex('3800000');
            var gasPrice = web3.toHex('20e9');

            var total_value = 0;
            for (var i=0; i < _value.length; i++){
                total_value += _value[i];
            }

            var total_value_hex = web3.toHex(total_value * 1000000000000000);

            console.log("Total value of Ether = ", total_value);
            console.log("Total value of Ether in hex", total_value_hex);

            console.log('nonce (transaction count on 0xda8107332d3edC065753d23fe23a42a308Ac8879): ' + nonce + '(' + nonceHex + ')');

            var rawTx = {
                nonce: nonceHex,
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: address_rainmaker,
                from: '0xda8107332d3edC065753d23fe23a42a308Ac8879',
                value: total_value_hex,
                data: rainmaker_call_data
            }

            var tx = new Tx(rawTx);
            tx.sign(privateKey);

            var serializedTx = tx.serialize();

            var hex_serialized = '0x' + serializedTx.toString('hex');
            // console.log("========= TXN serialized", hex_serialized);
            console.log("========= TXN serialized");
            nonce = nonce_original;

            // web3.eth.sendRawTransaction(hex_serialized, function(err, hash) {
            //     if (!err) {
            //         console.log("Hash of the TXN = ", hash);
            //     } else {
            //         console.log(err);
            //     }
            // });

            _to = [];
            _value = [];
            
        });
}
