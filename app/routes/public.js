var Async = require('async')
var User = require('../models/user')
var Building = require('../models/building')
var Tour = require('../models/tour')
var Era = require('../models/era')
var Neighborhood = require('../models/neighborhood')
var tools = require('../tools')
var slugify = require('slug')

module.exports = function(app) {

  app.get('/:type/:slug', function(req, res) {
    var func = function(results, err, models) {
      var slug = req.params.slug
      var type = req.params.type
      var data = {}
      console.log(results)
      res.render('index.pug', {
        errors: err,
        models: {
          buildings: results[0],
          tours: results[1],
          neighborhoods: results[2],
          eras: results[3]
        },
        user: req.user,
        loadedSlug: slug,
        loadedType: {
          s: tools.singularize(type),
          p: tools.pluralize(type)
        }
      })
    }
    tools.async(func, req, res)
  })

  app.get('/*', function(req, res) {
    var func = function(results, err, models) {
      var data = {}
      console.log(results)
      res.render('index.pug', {
        errors: err,
        models: {
          buildings: results[0],
          tours: results[1],
          neighborhoods: results[2],
          eras: results[3]
        },
        user: req.user
      })
    }
    tools.async(func, req, res)
  })
}