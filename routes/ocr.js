'use strict';

var fs = require('fs');
var appRootPath = require('app-root-path').path;
var commMoudle = require(appRootPath + '\\public\\nodejs\\common\\import.js');
var multer = require('multer');
var request = require('request');
var propertiesConfig = require('../config/propertiesConfig.js');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
});

var router = commMoudle.express.Router();

router.get('/favicon.ico', function (req, res) {
    res.status(204).end();
});

// file upload & OCR API
router.post('/api', upload.any(), function (req, res) {
    commMoudle.addLogging(req, JSON.stringify(req.files[0]));
    var f = req.files[0];

    
    if (f) {
        var targetFilePath = './uploads/' + f.originalname;

        fs.readFile(targetFilePath, function (fsReaderr, data) {
            if (!fsReaderr) {
                var base64 = new Buffer(data, 'binary').toString('base64');
                var binaryString = new Buffer(base64, 'base64').toString('binary');
                var buffer = new Buffer(binaryString, "binary");
                var params = {
                    'language': 'unk',
                    'detectOrientation': 'true'
                };

                request({
                    headers: {
                        'Ocp-Apim-Subscription-Key': propertiesConfig.ocr.subscriptionKey,
                        'Content-Type': 'application/octet-stream'
                    },
                    uri: propertiesConfig.ocr.uri + '?' + 'language=' + params.language + '&detectOrientation=' + params.detectOrientation,
                    body: buffer,
                    method: 'POST'
                }, function (reqErr, response, body) {
                    fs.stat(targetFilePath, function (fsStatError, stat) {
                        if (!fsStatError) {
                            fs.unlinkSync(targetFilePath); // 파일 삭제
                            if (!reqErr) {
                                if (!((JSON.parse(body)).code)) { // OCR 응답 성공                   
                                    res.send(body);
                                } else { // ocr api 호출시 에러이면  
                                    res.send({ code: (JSON.parse(body)).code, message: (JSON.parse(body)).message });
                                }                              
                            } else { // request 시 에러이면
                                console.log(reqErr);
                                res.send({ error: 'ocr api request error' });
                            }
                        } else { // fs 파일 존재 여부(stat) 확인 할 때 에러이면
                            console.log(fsStatError);
                            res.send({ error: 'There was an error deleting the file.' });
                        }
                    });
                });

            } else { // fs 파일 read 할 때 에러이면
                console.log(fsReaderr);
                res.send({ error: 'file Not found' });
            }            
        });
       
    } else { // 파라미터 없으면
        res.send({ error: 'parameter is empty' });
    }

});

module.exports = router;

/* url 로 ocr 호출
var uriBase = 'https://westus.api.cognitive.microsoft.com/vision/v1.0/ocr';
var subscriptionKey = 'fedbc6bb74714bd78270dc8f70593122';
var sourceImageUrl = 'http://kr-ocr.azurewebsites.net/uploads/' + f.originalname;
var params = {
    'language': 'unk',
    'detectOrientation': 'true'
};

request({
    headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
    },
    uri: uriBase + '?' + 'language=' + params.language + '&detectOrientation=' + params.detectOrientation,
    body: '{"url": ' + '"' + sourceImageUrl + '"}',
    method: 'POST'
}, function (err, response, body) {
    if (err) { // request err
        res.send({ code: 500, message: err });
    } else {
        if ((JSON.parse(body)).code) { // ocr api error
            res.send({ code: (JSON.parse(body)).code, message: (JSON.parse(body)).message });
        } else { // 성공
            commMoudle.addLogging(req, 'Ocr Api Call Success.');
            res.send({ code: 200, result: body });
        }
    }
});
*/
