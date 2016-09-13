var Async = require('async')
var tools = require('../tools')
var Building = tools.getModel('building')
var Tour = tools.getModel('tour')
var Neighborhood = tools.getModel('neighborhood')
var Style = tools.getModel('style')
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
          return callback(null, building)
        })
      },
      function(building, callback) {
        if(!building.tour)
          return callback(null, building, null)
        Tour.findOne({_id: building.tour}, function(err, tour) {
          return callback(null, building, tour)
        })
      },
      function(building, tour, callback) {
        if(!building.neighborhood)
          return callback(null, building, tour, null)
        Neighborhood.findOne(building.neighborhood, function(err, neighborhood) {
          return callback(null, building, tour, neighborhood)
        })
      },
      function(building, tour, neighborhood, callback) {
        if(!tour)
          return callback(null, building, tour, neighborhood, null)
        Building.find({tour: tour.id}, function(err, tourBuildings) {
          for(var i = 0; i < tourBuildings.length; i++) {
            if(tourBuildings[i]._id == id) {
              tourBuildings.splice(i, 1)
              break
            }
          }
          return callback(null, building, tour, neighborhood, tourBuildings)
        })
      },
      function(building, tour, neighborhood, tourBuildings, callback) {
        if(!building.style)
          return callback(null, building, tour, neighborhood, tourBuildings, null)
        Style.find(building.style.id, function(err, styles) {
          console.log(styles)
          return callback(null, building, tour, neighborhood, tourBuildings, styles)
        })
      },
    ], function (err, building, tour, neighborhood, tourBuildings, styles) {
      if(err)
        return err
      data = {
        object: building,
        tour: tour,
        neighborhood: neighborhood,
        tourBuildings: tourBuildings,
        styles: styles
      }
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