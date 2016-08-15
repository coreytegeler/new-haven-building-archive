var Async = require('async')
var User = require('./models/user')
var Building = require('./models/building')
var Neighborhood = require('./models/neighborhood')
var Tour = require('./models/tour')
var Era = require('./models/era')
var slugify = require('slug')
var moment = require('moment')
  
var async = function(func, req, res) {
  Async.parallel([
    function(callback) {
      Building.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    },
    function(callback) {
      Neighborhood.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    },
    function(callback) {
      Tour.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    },
    function(callback) {
      Era.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    }
  ],
  function(err, results) { 
    var models = {
      'buildings': results[0],
      'neighborhoods': results[1],
      'tours': results[2],
      'eras': results[3]
    }
    func(results, err, models)
  });
}

var isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/admin/login');
}

var singularize = function(string) {
  return string.replace(/s$/, '');
}

var pluralize = function(string) {
  return singularize(string) + 's';
}

var getModel = function(type) {
  var type = singularize(type)
  switch(type) {
    case 'user':
      return User
    case 'building':
      return Building
    case 'tour':
      return Tour
    case 'era':
      return Era
    case 'neighborhood':
      return Neighborhood
  }
}

var eras = ['1638-1860', '1860-1910', '1910-1950', '1950-1980', '1980-Today']

var getEra = function(year) {
  for(var i = 0; i < eras.length; i++) {
    var era = eras[i].split('-')
    if(year >= era[0] && (year < era[1] || era[1] == 'Today')) {
      return eras[i]
    }
  }
}

var preSave = function(item) {
  if(!item.slug)
    item.slug = slugify(item.name, {lower: true})
}
exports.slugify = slugify;
exports.isLoggedIn = isLoggedIn;
exports.singularize = singularize;
exports.pluralize = pluralize;
exports.getModel = getModel;
exports.preSave = preSave;
exports.getEra = getEra;
exports.eras = eras;
exports.async = async;