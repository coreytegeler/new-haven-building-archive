var User = require('./models/user')
var Building = require('./models/building')
var Tour = require('./models/tour')
var Era = require('./models/era')
var Hood = require('./models/hood')
var slug = require('slug')
var moment = require('moment')

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
    case 'hood':
      return Hood
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
    item.slug = slug(item.name, {lower: true})
}

exports.isLoggedIn = isLoggedIn;
exports.singularize = singularize;
exports.pluralize = pluralize;
exports.getModel = getModel;
exports.preSave = preSave;
exports.getEra = getEra;
exports.eras = eras;