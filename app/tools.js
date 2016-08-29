var Async = require('async')
var User = require('./models/user')
var Building = require('./models/building')
var Neighborhood = require('./models/neighborhood')
var Tour = require('./models/tour')
var Style = require('./models/style')
var Term = require('./models/term')
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
      Style.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    },
    function(callback) {
      Term.find({}, function(err, data) {
        if(err)
          callback(err)
        callback(null, data)
      })
    }
  ],
  function(err, results) { 
    var glossary = alphaSort(results[3].concat(results[4]))
    var models = {
      'buildings': results[0],
      'neighborhoods': results[1],
      'tours': results[2],
      'styles': results[3],
      'terms': results[4],
      'glossary': glossary
    }
    func(results, err, models)
  });
}

var isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/admin/login');
}

var alphaSort = function(object) {
  object.sort(function(a, b) {
    var textA = a.name.toUpperCase();
    var textB = b.name.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  })
  return object
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
    case 'style':
      return Style
    case 'term':
      return Term
  }
}

var eras = ['1638-1860', '1860-1910', '1910-1950', '1950-1980', '1980-Today']

var preSave = function(item) {
  if(!item.slug)
    item.slug = slugify(item.name, {lower: true})
}
exports.slugify = slugify;
exports.isLoggedIn = isLoggedIn;
exports.alphaSort = alphaSort;
exports.singularize = singularize;
exports.pluralize = pluralize;
exports.getModel = getModel;
exports.preSave = preSave;
exports.eras = eras;
exports.async = async;