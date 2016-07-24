var Async = require('async')
var User = require('../models/user')
var Building = require('../models/building')
var Tour = require('../models/tour')
var Era = require('../models/era')
var Neighborhood = require('../models/neighborhood')
var tools = require('../tools')
var slugify = require('slug')

module.exports = function(app) {

  app.get('/admin', function(req, res) {
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
      }
    ],
    function(err, results) { 
      var data = {}
      console.log(results)
      res.render('admin/index.pug', {
        errors: err,
        models: {
          buildings: results[0],
          tours: results[1]
        }
      })
    })
  })

  app.get('/admin/:type', function(req, res) {
    var type = req.params.type
    if(type == 'user' || type == 'users')
      var model = User
    else
      var model = tools.getModel(type)
    model.find({}, function(err, objects) {
      if(err)
        callback(err)
      console.log(objects)
      res.render('admin/model.pug', {
        type: {
          s: tools.singularize(type),
          p: tools.pluralize(type)
        },
        objects: objects
      })
    })
  })

  app.get('/admin/:type/new', function(req, res) {
    var type = req.params.type
    res.render('admin/edit.pug', {
      type: {
        s: tools.singularize(type),
        p: tools.pluralize(type)
      },
      action: 'create'
    })
  })

  app.post('/admin/:type/create', function(req, res) {
    var data = req.body
    var type = tools.singularize(req.params.type)
    var errors
    switch(type) {
      case 'user':
        var object = new User(data)
        break
      case 'building':
        var object = new Building(data)
        break
      case 'tour':
        var object = new Tour(data)
        break
      case 'neighborhood':
        var object = new Neighborhood(data)
        break 
    }
    object.save(function(err) {
      if(err) {
        console.log('Failed:')
        console.log(err)
        res.render('admin/edit.pug', {
          errors: err,
          type: {
            s: tools.singularize(type),
            p: tools.pluralize(type)
          },
          action: 'create'
        })
      } else {
        console.log('Updated:')
        console.log(object)
        res.redirect('/admin/'+type)
      }
    })
  })

  app.get('/admin/:type/edit/:slug', function(req, res) {
    var type = req.params.type
    var slug = req.params.slug
    var model = tools.getModel(type)
    if(!slug) {
      res.redirect('/admin/'+type+'/new')
    } else {
      model.findOne({slug: slug}, function(err, object) {
        if (err)
          throw err
        var data = {
          object: object,
          id: object._id,
          action: 'update',
          type: {
            s: tools.singularize(type),
            p: tools.pluralize(type)
          }
        }
        if(tools.singularize(type) == 'building')
          data['eras'] = tools.eras
        console.log(data)
        res.render('admin/edit.pug', data)
      })
    }
  })

  app.post('/admin/:type/update/:id', function(req, res) {
    var data = req.body
    var type = req.params.type
    var id = req.params.id
    var errors
    var model = tools.getModel(type)
    if(data.name) {
      var slug = slugify(data.name, {lower: true})
      data.slug = slug
    }
    if(tools.singularize(type) == 'building') {
      data.era = tools.getEra(data.dateConstructed)
    }
    model.findOneAndUpdate({_id: id}, data, {runValidators: true}, function(err, object) {
      if(err) {
        console.log('Failed:')
        console.log(err)
        res.render('admin/edit.pug', {
          errors: err,
          type: {
            s: tools.singularize(type),
            p: tools.pluralize(type)
          },
          object: object,
          action: 'update'
        })
      } else {
        console.log('Updated:')
        console.log(object)
        res.redirect('/admin/'+type+'/edit/'+slug)
      }
    })
  })

  app.get('/admin/:type/remove/:id', function(req, res) {
    var type = req.params.type
    var id = req.params.id
    var model = tools.getModel(type)
    model.findByIdAndRemove(id, function(err, object) {
      if (err) throw err
      console.log(type+' successfully deleted!')
      res.redirect('/admin/'+type)
    })
  })

  app.get('/admin/:type/quick-create', function(req, res) {
    var type = req.params.type
    if(!type)
      return
    res.render('admin/quick.pug', {
      type: type
    })
  })

  app.post('/admin/:type/quick-create', function(req, res) {
    var data = req.body
    var type = req.params.type
    var errors
    console.log(type)
    switch(type) {
      case 'era':
        var object = new Era(data)
        break
      case 'neighborhood':
        var object = new Neighborhood(data)
        break
      default:
        return
    }
    object.save(function(err) {
      if(err) {
        return res.json(err)
      }
      console.log(object)
      return res.json(object)
    })
  })
}