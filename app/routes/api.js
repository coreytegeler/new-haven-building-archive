var Async = require('async')
var tools = require('../tools')
var Tour = tools.getModel('tour')
var Building = tools.getModel('building')
querystring = require('querystring');
module.exports = function(app) {

	app.get('/api/building/*', function(req, res) {
    var type = 'building'
    var slug = req.query.slug
    var id = req.query.id
    var format = req.query.format
    var filter = req.query.filter
    Async.waterfall([
      function(callback) {
        Building.findOne(id, function(err, building) {
          if(err)
            callback(err)
          callback(null, building);
        })
      },
      function(building, callback) {
        Tour.findOne(building.tour, function(err, tour) {
          if(err)
            callback(err)
          callback(null, building, tour);
        })
      },
      function(building, tour, callback) {
        Building.find({tour: building.tour}, function(err, buildings) {
          if(err)
            callback(err)
          callback(null, building, tour, buildings);
        })
      }
    ], function (err, building, tour, buildings) {
      if(err)
        callback(err)
      data = {
        'object': building,
        'tour': tour,
        'buildings': buildings
      }
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('building.pug', data)
      }
    })
  })

  app.get('/api/tour/*', function(req, res) {
    var type = 'tour'
    var slug = req.query.slug
    var id = req.query.id
    var format = req.query.format
    var filter = req.query.filter
    Async.parallel([
      function(callback) {
        Tour.findOne(id, function(err, tour) {
          if(err)
            callback(err)
          callback(null, tour);
        })
      },
      function(callback) {
        Building.find({'tour': id}, function(err, buildings) {
          if(err)
            callback(err)
          callback(null, buildings);
        })
      }
    ], function (err, results) {
      data = {
        tour: results[0],
        buildings: results[1]
      }
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('tour.pug', data)
      }
    })
  })
}