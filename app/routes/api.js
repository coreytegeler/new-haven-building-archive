var Async = require('async')
var tools = require('../tools')
querystring = require('querystring');
module.exports = function(app) {

  app.get('/api/tour/*', function(req, res) {
    var type = 'tour'
    var slug = req.query.slug
    var format = req.query.format
    var filter = req.query.filter
    var Tour = tools.getModel('tour')
    var Building = tools.getModel('building')
    Async.waterfall([
      function(callback) {
        Tour.findOne({'slug': slug}, function(err, tour) {
          if(err)
            callback(err)
          callback(null, tour);
        })
      },
      function(tour, callback) {
        Building.find({'tour': tour._id.toString()}, function(err, buildings) {
          data = {
            tour: tour,
            buildings: buildings
          }
          callback(null, data);
        })
      }
    ], function (err, data) {
      if(format == 'json') {
        return res.json(data)
      } else if(format == 'html') {
        return res.render('tour.pug', data)
      }
    })
  })

	app.get('/api/building/*', function(req, res) {
    var type = 'building'
    var slug = req.query.slug
    var format = req.query.format
    var filter = req.query.filter
    var model = tools.getModel(type)
    var query = {}
    var template = type
    if(!model)
      return res.json(null)
    if(slug != 'all')
      if(filter) {
        template = filter
        query[filter] = slug
      } else if(slug) {
        query['slug'] = slug
      }
    if(type == 'building' && filter)
      template = '_'+template
    model.find(query, function(err, objects) {
      if(err)
        callback(err)
      if(format == 'json')
        return res.json(objects)
      else if(format == 'html')
        if(type=='building' && !filter)
          objects = objects[0]
        return res.render(template+'.pug', {
          slug: slug,
          type: type,
          object: objects,
        })
    })
  })
}