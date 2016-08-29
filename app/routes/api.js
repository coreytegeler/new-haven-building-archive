var Async = require('async')
var tools = require('../tools')
var Tour = tools.getModel('tour')
var Building = tools.getModel('building')
querystring = require('querystring');
module.exports = function(app) {

	app.get('/api/*', function(req, res) {
    var type = req.query.type
    var id = req.query.id
    var slug = req.query.slug
    var format = req.query.format
    var model = tools.getModel(type)
    var query = {}
    if(type == 'tour' && format == 'html')
      getTourSection(slug, id, format, res) 
    else if(type == 'building' && format == 'html')
      getBuildingSection(slug, id, format, res)  
    else
      model.find(query, function(err, response) {
        if(err)
          callback(err)
        return res.json(response)
    })
  })

  var getBuildingSection = function(slug, id, format, res)  {
    Async.waterfall([
      function(callback) {
        Building.findOne({_id:id}, function(err, building) {
          callback(null, building);
        })
      },
      function(building, callback) {
        Tour.findOne({_id:building.tour}, function(err, tour) {
          callback(null, building, tour);
        })
      },
      function(building, tour, callback) {
        if(!tour)
          callback(null, building, tour, null)
        else
          Building.find({tour: tour.id}, function(err, tourBuildings) {
            callback(null, building, tour, tourBuildings);
          })
      },
    ], function (err, building, tour, tourBuildings) {
      if(err)
        return err
      data = {
        object: building,
        tour: tour,
        tourBuildings: tourBuildings
      }
      console.log(data)
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('building.pug', data)
      }
    })
  }

  var getTourSection = function(slug, id, format, res)  {
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
  }
}