var mongo = require('mongodb');

var request = require('request');

var Q = require('q');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure,
	ObjectID = mongo.ObjectID;

var server = new Server('localhost', 27017, {
		auto_reconnect: true
	}),
	db = new Db('tranDB', server);

db.open(function(err, db) {
	if (!err) {
		console.log("Connected to TranDB");

		db.collection('accounttransaction', {
			strict: true
		}, function(err, collection) {
			if (err) {
				console.log("the accounttransaction collection doesnt exist");
				populateDB();
			}
		});

		db.collection('siccode', {
			strict: true
		}, function(err, collection) {
			if (err) {
				console.log("the siccode collection doesnt exist");
				populateSicCode();
			}
		});
	}
});

exports.findSICCode = function(req, res) {
	var id = req.params.id;
	console.log("retrieving SIC details for code: ", +id);

	db.collection('siccode', function(err, collection) {
		collection.find({
			'StandardIndustryCode': id
		}).toArray(function(err, item) {
			console.log(item);
			res.send(item);
		});

	});
};

function getSICCode(sicCode, res){
console.log('sicCode: ' + sicCode);
db.collection('sics', function(err, collection) {
        collection.findOne({'StandardIndustryCode':parseInt(sicCode)}, function(err, item) {
        if (item != null) { 
        	console.log('Item: ' + item.stringify);
  			res(item.CategoryName);
        }
        else {
        res('No Category');
        }
        });
    });
}


exports.findById = function(req, res) {
	var id = req.params.id;
	console.log("retrieving transaction details for account: ", +id);
	db.collection('accounttransaction', function(err, collection) {
		collection.find({
			'AccountToken': id
		}).toArray(function(err, item) {
			console.log(item);
			res.send(item);
		});

	});
};

exports.findAll = function(req, res) {
	db.collection('accounttransaction', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};



//for each of the SIC code, query the SIC API to get the category code
function makeRequest(obj) {
	
	var def = Q.defer();
	
	request('https://transactioncategorization-arungeorge101.c9users.io/siccode/' + obj.StandardIndustryCode, function(error1, response1, body1) {
		if (!error1 && response1.statusCode == 200) {
			console.log("res:" + body1);
			var sicCodeJson = JSON.parse(body1);
			console.log("res 1" + sicCodeJson[0].CategoryName);
//								jsonTransactions[i].TransactionCategory = sicCodeJson[0].CategoryName;
			def.resolve( sicCodeJson[0].CategoryName );
		} else {
			def.reject(error1);
		}
		

	// db.collection('siccode', function(err, collection) {
	// collection.find({'StandardIndustryCode': obj.StandardIndustryCode}).toArray(function(err, item) {
	// 	console.log(item);
	// });
	// jsonTransactions[i].TransactionCategory = item.CategoryName;
	});

	return def.promise;
}



exports.findtrancategory = function(req, res) {
		var id = req.params.id;

		var jsonTransactions;
		//call the transaction service API and get the data
		request('https://transactioncategorization-arungeorge101.c9users.io/originalTransactions/' + id, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					jsonTransactions = JSON.parse(body);
				}

				var promises = [];

				//Now query through the transaction data to find the StandardIndustryCode

				for (var i = 0; i < jsonTransactions.length; i++) {
					var obj = jsonTransactions[i];
					console.log("obj:" + obj.StandardIndustryCode);
					
					promises.push(makeRequest(obj));
				}
				
				Q.all(promises).then(function(res12){
					console.log('done');
					console.log(JSON.stringify(res12));
					
					for (var i = 0; i < jsonTransactions.length; i++) {
					jsonTransactions[i].TransactionCategory = res12[i];
					}
					//res.setHeader('Access-Control-Allow-Origin', 'http://run.plnkr.co');
					res.send(jsonTransactions);
				});
			});

		}

		var populateDB = function() {

			var transactions = [{
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-10-30",
				PostedAmount: "721.33",
				TransactionReferenceNumber: "24427335286710022116333",
				DebitCreditCode: "D",
				EffectiveDate: "2015-10-12",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "BYERLY'S               MINNEAPOLIS  MN",
				StandardIndustryCode: "05411",
				TransactionCode: "600",
				TransactionDateTime: "2015-10-19T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-12",
				PostedAmount: "847.21",
				TransactionReferenceNumber: "24427335286710022116334",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-12",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "TARGET               MINNEAPOLIS  MN",
				StandardIndustryCode: "05412",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-12T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-11",
				PostedAmount: "76.21",
				TransactionReferenceNumber: "24427335286710022116335",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-11",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "BEST BUY               MINNEAPOLIS  MN",
				StandardIndustryCode: "05413",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-11T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-10",
				PostedAmount: "387.97",
				TransactionReferenceNumber: "24427335286710022116336",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-10",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "ORBITZ               NEW YORK  NY",
				StandardIndustryCode: "05414",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-10T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-09",
				PostedAmount: "54.12",
				TransactionReferenceNumber: "24427335286710022116337",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-09",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "SUPER AMERICA           ATLANTA GA",
				StandardIndustryCode: "05420",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-09T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-07",
				PostedAmount: "87.12",
				TransactionReferenceNumber: "24427335286710022116338",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-07",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "ERICS BREW PUB EAGAN MN",
				StandardIndustryCode: "05409",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-07T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-02",
				PostedAmount: "120.12",
				TransactionReferenceNumber: "24427335286710022116339",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-02",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "CUB FOODS           EAGAN MN",
				StandardIndustryCode: "05423",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-02T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-02",
				PostedAmount: "898.12",
				TransactionReferenceNumber: "24427335286710022116340",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-02",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "FREDS AUTO EAGAN MN",
				StandardIndustryCode: "05424",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-02T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-02",
				PostedAmount: "324.98",
				TransactionReferenceNumber: "24427335286710022116341",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-02",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "HOME DEPOT EAGAN MN",
				StandardIndustryCode: "05425",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-02T02:33:02.379524"
			}, {
				AccountToken: "3456",
				AccountPrimaryIdentifier: "1234567890123456",
				PostedDate: "2015-08-02",
				PostedAmount: "234.18",
				TransactionReferenceNumber: "24427335286710022116342",
				DebitCreditCode: "D",
				EffectiveDate: "2015-08-02",
				CardHolderName: "2068JAMES MICHAEL LOMAKOSKI",
				ShortDescription: "PUR",
				TransactionDescription: "KOHLS EAGAN MN",
				StandardIndustryCode: "05426",
				TransactionCode: "600",
				TransactionDateTime: "2015-08-02T02:33:02.379524"
			}];

			db.collection('accounttransaction', function(err, collection) {
				collection.insert(transactions, {
					safe: true
				}, function(err, result) {});
			});

		};

		var populateSicCode = function() {

			var siccodes = [{
				StandardIndustryCode: "05411",
				CategoryName: "Grocery"
			}, {
				StandardIndustryCode: "05412",
				CategoryName: "Restaurant"
			}, {
				StandardIndustryCode: "05413",
				CategoryName: "Gas"
			}, {
				StandardIndustryCode: "05414",
				CategoryName: "Home Goods"
			}, {
				StandardIndustryCode: "05420",
				CategoryName: "Electronics"
			}, {
				StandardIndustryCode: "05409",
				CategoryName: "A"
			}, {
				StandardIndustryCode: "05423",
				CategoryName: "B"
			}, {
				StandardIndustryCode: "05424",
				CategoryName: "C"
			}, {
				StandardIndustryCode: "05425",
				CategoryName: "D"
			}, {
				StandardIndustryCode: "05426",
				CategoryName: "E"
			}];

			db.collection('siccode', function(err, collection) {
				collection.insert(siccodes, {
					safe: true
				}, function(err, result) {});
			});

		};
		

exports.updateTran = function(req, res) {
    var id = req.params.id;
    var tran = req.body;
    console.log('asd: ' + req.body);
    db.collection('trans', function(err, collection) {
        collection.findOne({'_id':new ObjectID(id)}, function(err, item) {
        if (item.TransactionCategory == req.body['TransactionCategory']) {
        res.send({'error:':'Error - TransactionCategory didnt change'});
        }
        else {
        item['UserOverrideCategory'] = req.body['TransactionCategory'];
        getSICCode(item.StandardIndustryCode, function(responseCategory) {
            item.TransactionCategory = responseCategory;
            });
        tran = item;
        console.log('Updating tran      : ' + id);
console.log(JSON.stringify(tran));
    db.collection('trans', function(err, collection) {
        collection.update({'_id':new ObjectID(id)}, tran, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating tran: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' Transactions updated');l
                res.send(tran);
            }
        });
    });
        }
            
        });
    });
    
}
