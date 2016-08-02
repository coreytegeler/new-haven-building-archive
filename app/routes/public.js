var Async = require('async')
var User = require('../models/user')
var Building = require('../models/building')
var Tour = require('../models/tour')
var Era = require('../models/era')
var Neighborhood = require('../models/neighborhood')
var tools = require('../tools')
var slugify = require('slug')

module.exports = function(app) {
  app.get('/*', function(req, res) {
    Async.parallel([
      function(callback) {
        Building.find({}, function(err, data) {
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
        Neighborhood.find({}, function(err, data) {
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
      var data = {}
      console.log(results)
      res.render('index.pug', {
        errors: err,
        objects: {
          buildings: results[0],
          tours: results[1],
          neighborhoods: results[2],
          eras: results[3]
        },
        user: req.user
      })
    })
  })
}