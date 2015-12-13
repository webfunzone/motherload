'use strict';
var path = require('path');
var express = require('express');
var fs = require('fs');
var cloudinary = require('cloudinary');

var router = express.Router();

router.get('/', function (request, response) {
    if (request.signedCookies.name) {
        response.render('input', {message: null, results: null});
    } else {
        response.send("Please <a href='/main#login'>Login</a>");
    }
});

router.post('/new', function (request, response) {
    var collection = request.db.collection('articles');
    var newArticle = {
        main_category: request.body.m_category,
        c_name: request.body.c_name,
        content: request.body.contentText,
        logo: request.body.logo,
        website: request.body.website,
        timestamp: new Date()
    };
    if (newArticle.logo) {
        var logo = newArticle.logo;
        var c_name = newArticle.c_name;
        var imgPath = 'public/images/' + logo;
        var syspath = path.join(__dirname, '..', imgPath);
        var replace_with = c_name.replace(/\s+/g, "").toLowerCase();
        var stats = fs.statSync(syspath);
        if (!stats) {
            console.log(err);
            newArticle.logo = logo;
        }
        else {
            if (stats.isFile()) {
                cloudinary.uploader.upload(imgPath, function (result) {
                }, {public_id: replace_with, folder: 'startup'});
                fs.unlink(imgPath, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                newArticle.logo = replace_with + logo.substr(logo.length - 4, logo.length - 1);
            }
        }
    }
    var onInsert = function (err) {
        if (err) {
            console.log('error: ' + err);
        }
        else {
            response.status(200).send({"message": "Article Added"});
        }
    };
    collection.insert(newArticle, onInsert);
});

router.post('/find', function (request, response) {
    var collection = request.db.collection('articles');
    var c_name = request.body.f_c_name;
    var onSearch = function (err, docs) {
        if (err) {
            console.log('error: ' + err);
        }
        else if (docs === null) {
            response.status(404).send({results: null, message: 'Not Found'});
        }
        else {
            response.status(200).send({results: docs, message: 'Search Successful'});
        }
    };
    collection.findOne({c_name: c_name}, onSearch);
});

router.post('/edit', function (request, response) {
    var collection = request.db.collection('articles');
    var newArticle = {
        main_category: request.body.e_m_category,
        c_name: request.body.e_c_name,
        content: request.body.e_contentText,
        logo: request.body.e_logo,
        website: request.body.e_website,
        timestamp: new Date()
    };
    var test = newArticle.c_name.replace(/\s+/g, "").toLowerCase() + newArticle.logo.substr(newArticle.logo.length - 4, newArticle.logo.length - 1);
    console.log(test);
    if (newArticle.logo && !(newArticle.logo === test)) {
        var logo = newArticle.logo;
        var c_name = newArticle.c_name;
        var imgPath = 'public/images/' + logo;
        var syspath = path.join(__dirname, '..', imgPath);
        var replace_with = c_name.replace(/\s+/g, "").toLowerCase();
        var stats = fs.statSync(syspath);
        if (!stats) {
            console.log(err);
            newArticle.logo = logo;
        }
        else {
            if (stats.isFile()) {
                cloudinary.uploader.upload(imgPath, function (result) {
                }, {public_id: replace_with, folder: 'startup'});
                fs.unlink(imgPath, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                newArticle.logo = replace_with + logo.substr(logo.length - 4, logo.length - 1);
            }
        }
    }
    var onUpdate = function (err) {
        console.log('here');
        if (err) {
            console.log('error: ' + err);
        }
        else {
            response.status(200).send({message: 'Updated', results: null});
        }
    };
    collection.findAndModify(
        {c_name: newArticle.c_name},
        [['c_name', 'asc']],
        {
            $set: {
                main_category: newArticle.main_category,
                content: newArticle.content,
                logo: newArticle.logo,
                website: newArticle.website,
                timestamp: newArticle.timestamp
            }
        },
        {new: true}
        , onUpdate
    );

});

router.post('/delete', function (request, response) {
    var collection = request.db.collection('articles');
    var updateCollection = request.db.collection('updates');
    var c_name = request.body.d_c_name;
    var onDelete = function (err, results) {
        if (err) {
            console.log('error: ' + err);
        }
        else {
            console.log(results);
            if (results.result.n != 0) {
                cloudinary.api.delete_resources(['startup/' + c_name.replace(/\s+/g, "").toLowerCase()],
                    function (result) {
                        console.log(result);
                    });
                response.status(200).send({message: 'Deleted', results: null});
            } else {
                cloudinary.api.delete_resources(['startup/' + c_name.replace(/\s+/g, "").toLowerCase()],
                    function (result) {
                        console.log(result);
                    });
                response.status(200).send({message: 'Article Not Found', results: null});
            }
        }
    };
    var query = {c_name: c_name};
    collection.remove(query, onDelete);
});

router.post('/upload', function (request, response) {
    console.log('Image uploaded: ' + request.files.file.name);
    // console.log(request.body);
    // console.log(request.files.file);

    response.status(200).send({message: 'Uploaded', results: null});
});

module.exports = router;
