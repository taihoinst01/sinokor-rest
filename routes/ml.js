'use strict';

var commMoudle = require(require('app-root-path').path + '\\public\\nodejs\\common\\import.js');
var pythonConfig = require(require('app-root-path').path + '\\config\\pythonConfig.js');
var pythonShell = require('python-shell');
var csvWriter = require('csv-write-stream');

var router = commMoudle.express.Router();

router.get('/favicon.ico', function (req, res) {
    res.status(204).end();
});

router.post('/api', function (req, res) {
    var data;
    var type = req.body.type;

    if (type == 'formLabelMapping') {

    } else if (type == 'formMapping') {
        data = req.body.data;
    } else if (type == 'columnMapping') {
        data = JSON.parse(req.body.data);
    }
    
    commMoudle.addLogging(req, JSON.stringify(req.body.data));   
	var param = [];
	var targetPy = '';
	var ogCompany = [];
	var ctnm = [];

    try {
        if (type == 'formLabelMapping') {
            targetPy = 'formLabelMapping.py';
            for (var i in data) {
                param.push({ DATA: "'" + data[i].sid.replace(/,/g, "','") + "'", CLASS: 0 });
            }
        } else if (type == 'formMapping') {
            targetPy = 'formMapping.py';
 
            param.push({ 'DATA': "'"+ data + "'", 'CLASS': 0 })
			/*
            for (var i in data) {
                if (data[i].formLabel == 0) {
                    ogCompany.push(data[i].sid);
                } else if (data[i].formLabel == 1) {
                    ctnm.push(data[i].sid);
                }
            }

            if (ogCompany.length == 1 && ctnm.length == 1) {
                param.push({ DATA: "'" + ogCompany[0].replace(/,/g, "','") + "','" + ctnm[0].replace(/,/g, "','") + "'", CLASS: 0 });
            } else if (ogCompany.length > 1 && ctnm.length == 1) {
                for (var i in ogCompany) {
                    param.push({ DATA: "'" + ogCompany[i].replace(/,/g, "','") + "','" + ctnm[0].replace(/,/g, "','") + "'", CLASS: 0 });
                }
            } else if (ogCompany.length == 1 && ctnm.length > 1) {
                for (var i in ctnm) {
                    param.push({ DATA: "'" + ogCompany[0].replace(/,/g, "','") + "','" + ctnm[i].replace(/,/g, "','") + "'", CLASS: 0 });
                }
            }
            param.push({ DATA: data[i].sid, CLASS: 0 });
            */          
        } else if (type == 'columnMapping') {
            targetPy = 'columnMapping.py';
            for (var i in data) {
				param.push({ 'DATA': "'" + data[i].mappingSid + "'", 'CLASS': 0 });
				/*
                if (data[i].colLbl == -1) {
                    param.push({ 'DATA': "'" + data[i].mappingSid + "'", 'CLASS': 0 });
                    //param.push({ DATA: "'" + req.body.data.docCategory.DOCTYPE + "','" + data[i].sid.replace(/,/g, "','") + "'", CLASS: 0 });
				}
				*/
            }
        }
        if (param.length != 0) {
			/*
            //Azure WebApp
            var options = {
                mode: 'json',
                encoding: 'utf8',
                pythonPath: 'D:\\home\\python354x64\\python.exe',
                pythonOptions: ['-u'],
                scriptPath: require('app-root-path').path + '\\ml',
                args: [JSON.stringify(param)]
            };
			*/
            
            pythonConfig.columnOptions.args = [JSON.stringify(param)];
            pythonShell.run(targetPy, pythonConfig.columnOptions, function (err, results) {
                if (err) {
                    console.log(err);
                    res.send({ code: 500, message: err });
                } else {
                    results[0] = results[0].replace(/Scored Labels/gi, 'ScoredLabels');
                    results[0] = results[0].replace(/Scored Probabilities/gi, 'ScoredProbabilities');
                    var outResult = JSON.parse(results[0]).Results.output1;
                    commMoudle.addLogging(req, JSON.stringify(outResult));
					
                    if (type == 'formLabelMapping') {
                        for (var i in outResult) {
							for(var j in req.body.data.data){
								if (req.body.data.data[j].sid == outResult[i].DATA.replace(/\'/g, '')) {
									if (!req.body.data.data[j].formLabel) {
										req.body.data.data[j].formLabel = outResult[i].ScoredLabels;
										break;
									}
								}
							}
                        }
                    } else if (type == 'formMapping') {
                        
                        var docType = 0;
                        var docScore = 0;
                        for (var i in outResult) {
                            if (outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"'] > docScore) {
                                docType = outResult[i].ScoredLabels;
                                docScore = outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"'];
                            }
                        }
                        data = { 'DOCTYPE': docType, 'SCORE': Number(docScore).toFixed(2) };
                        //req.body.data.docCategory = { DOCTYPE: docNum, Score: docScore };
                    } else if (type == 'columnMapping') {
                        for (var i in outResult) {
							for(var j in data){
								if (data[j].mappingSid == outResult[i].DATA.replace(/\'/g, '')) {
									if (data[j].colLbl == -1) {
										data[j].colLbl = outResult[i].ScoredLabels;
                                        data[j].colAccu = Number(Number(outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"']).toFixed(2));
										break;
									}
								}
								/*
								if (req.body.data.docCategory.DOCTYPE + ',' + req.body.data.data[j].sid == outResult[i].DATA.replace(/\'/g, '')) {
									if (!req.body.data.data[j].colLbl) {
										req.body.data.data[j].colLbl = outResult[i].ScoredLabels;
										req.body.data.data[j].colAccu = outResult[i]['ScoredProbabilities for Class "' + outResult[i].ScoredLabels + '"'];
										break;
									}
								}
								*/
							}
                        }
                    }
                    commMoudle.addLogging(req, type + ' Machine Learning Query Success.');
                    res.send(data);
                }
            });
        } else {
            res.send(data);
        }
    } catch (e) {
        console.log(e);
        res.send(data);
    }
});


// 학습파일(.csv) 데이터 추가
router.post('/train', function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.body));
    //var flmdata = req.body.flmdata;
	var fmData = req.body.fmData;
    var cmData;
    if (typeof req.body.cmData == 'string') {
        cmData = JSON.parse(req.body.cmData);
    } else {
        cmData = req.body.cmData;
    }
	//var dataArr = [flmdata, fmData, cmData];
	var dataArr = [fmData, cmData]
	//var csvPathArr = ['formLabelMapping.csv','formMapping.csv','columnMapping.csv'];
	var csvPathArr = ['formMapping.csv', 'columnMapping.csv'];

    try {
        for (var i in dataArr) {
            var trainData = dataArr[i];
			if(trainData.length != 0){
				var csvPath = require('app-root-path').path + '\\uploads\\trainData\\' + csvPathArr[i];
				var writer = csvWriter();

				if (!commMoudle.fs.existsSync(csvPath)) {
					writer = csvWriter({ headers: ['DATA', 'CLASS'] });
				} else {
					writer = csvWriter({ sendHeaders: false });
				}
				writer.pipe(commMoudle.fs.createWriteStream(csvPath, { flags: 'a' }));
				
				if(csvPathArr[i] == 'formMapping.csv'){
					writer.write({
						DATA: "''" + trainData[0].data + "'",
						CLASS: trainData[0].class
					});
				}else{
					for (var i = 0; i < trainData.length; i++) {
						var item = trainData[i];
						writer.write({
							DATA: "''" + item.data + "'",
							CLASS: item.class
						});
						
					}
				}				
                writer.end();
                commMoudle.addLogging(req, 'Machine Learning ReTrain Success.')
			}
        }

        res.send({ code: 200, message: 'Machine Learning ReTrain Success.' });
    } catch (e) {
        console.log(e);
        res.send({ code: 500, message: e });
    }
});

// 데이터 롤백 후 학습
router.post('/rollbackTrain', function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.body));
    //var flmdata = req.body.flmdata;
    var fmData = req.body.fmData;
    var cmData;
    if (typeof req.body.cmData == 'string') {
        cmData = JSON.parse(req.body.cmData);
    } else {
        cmData = req.body.cmData;
    }
    //var dataArr = [flmdata, fmData, cmData];
    var dataArr = [fmData, cmData]
    //var csvPathArr = ['formLabelMapping.csv','formMapping.csv','columnMapping.csv'];
    var csvPathArr = ['formMapping.csv', 'columnMapping.csv'];

    try {
        for (var i in dataArr) {
            var trainData = dataArr[i];
            if (trainData.length != 0) {
                var csvPath = require('app-root-path').path + '\\uploads\\trainData\\' + csvPathArr[i];
                var writer = csvWriter();
                writer = csvWriter({ headers: ['DATA', 'CLASS'] });
                writer.pipe(commMoudle.fs.createWriteStream(csvPath, { flags: 'w' }));

                if (csvPathArr[i] == 'formMapping.csv') {
                    for (var i = 0; i < trainData.length; i++) {
                        var item = trainData[i];
                        writer.write({
                            DATA: "''" + item.DATA + "'",
                            CLASS: item.CLASS,
                        });

                    }
                } else {
                    for (var i = 0; i < trainData.length; i++) {
                        var item = trainData[i];
                        writer.write({
                            DATA: "''" + item.DATA + "'",
                            CLASS: item.CLASS
                        });

                    }
                }
                writer.end();
                commMoudle.addLogging(req, 'Machine Learning ReTrain Success.')
            }
        }

        res.send({ code: 200, message: 'Machine Learning ReTrain Success.' });
    } catch (e) {
        console.log(e);
        res.send({ code: 500, message: e });
    }
});

module.exports = router;
