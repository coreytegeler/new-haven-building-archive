var Async = require('async')
var tools = require('../tools')
var Tour = tools.getModel('tour')
var Building = tools.getModel('building')
querystring = require('querystring');
module.exports = function(app) {

	app.get('/api/json/*', function(req, res) {
    var type = req.query.type
    var slug = req.query.slug
    var id = req.query.id
    console.log(type)
    var model = tools.getModel(type)
    var query = {}
    if(slug)
      query['slug'] = slug
    model.find(query, function(err, response) {
      if(err)
        callback(err)
      return res.json(response)
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