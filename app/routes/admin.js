var Async = require('async')
var User = require('../models/user')
var Building = require('../models/building')
var Tour = require('../models/tour')
var Neighborhood = require('../models/neighborhood')
var Style = require('../models/style')
var Term = require('../models/term')
var tools = require('../tools')
var slugify = require('slug')
var fs = require('fs')
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart()

module.exports = function(app) {
  app.get('/admin', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var data = {}
      res.render('admin/index.pug', {
        errors: err,
        loadedType: {s: 'home',p: 'home'},
        models: models,
        user: req.user
      })
    }, req, res)
  })

  app.get('/admin/:type', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var type = req.params.type
      if(type == 'user' || type == 'users')
        var model = User
      else
        var model = tools.getModel(type)
      res.render('admin/model.pug', {
        errors: err,
        loadedType: {
          s: tools.singularize(type),
          p: tools.pluralize(type)
        },
        models: models,
        user: req.user
      })
    }, req, res)
  })

  app.get('/admin/:type/new', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
      var type = req.params.type
      if(type == 'user' || type == 'users')
        var model = User
      else
        var model = tools.getModel(type)
      res.render('admin/edit.pug', {
        loadedType: {
          s: tools.singularize(type),
          p: tools.pluralize(type)
        },
        models: models,
        action: 'create',
        user: req.user
      })
    }, req, res)
  })

  app.post('/admin/:type/create', tools.isLoggedIn, function(req, res) {
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
      case 'style':
        var object = new Style(data)
        break 
      case 'term':
        var object = new Term(data)
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

  app.get('/admin/:type/edit/:slug', tools.isLoggedIn, function(req, res) {
    tools.async(function(results, err, models) {
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
            action: 'update',
            loadedType: {
              s: tools.singularize(type),
              p: tools.pluralize(type)
            },
            models: models,
            user: req.user
          }
          if(tools.singularize(type) == 'building')
            data['eras'] = tools.eras
          res.render('admin/edit.pug', data)
        })
      }
    })
  })

  app.post('/admin/:type/update/:id', multipartMiddleware, tools.isLoggedIn, function(req, res) {
    var data = req.body
    var type = req.params.type
    var id = req.params.id
    var errors
    var model = tools.getModel(type)
    if(data.name) {
      var slug = slugify(data.name, {lower: true})
      data.slug = slug
    }
    fs.readFile(req.files.image.path, function (err, img) {
      var imageName = req.files.image.name
      if(imageName){
        var newPath = '/uploads/' + imageName;
        fs.writeFile(newPath, img, function (err) {
          if(!data.images)
            data.images = []
          data.images.push(newPath)
        });
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
  })

  app.get('/admin/:type/remove/:id', tools.isLoggedIn, function(req, res) {
    var type = req.params.type
    var id = req.params.id
    var model = tools.getModel(type)
    model.findByIdAndRemove(id, function(err, object) {
      if (err) throw err
      console.log(type+' successfully deleted!')
      res.redirect('/admin/'+type)
    })
  })

  app.get('/admin/:type/quick-create', tools.isLoggedIn, function(req, res) {
    var type = req.params.type
    if(!type)
      return
    res.render('admin/quick.pug', {
      type: type
    })
  })

  app.post('/admin/:type/quick-create', tools.isLoggedIn, function(req, res) {
    var data = req.body
    var type = tools.singularize(req.params.type)
    var errors
    switch(type) {
      case 'neighborhood':
        var object = new Neighborhood(data)
        break
      case 'tour':
        var object = new Tour(data)
        break
      case 'style':
        var object = new Style(data)
        break
      default:
        return
    }
    object.save(function(err) {
      if(err) {
        return res.json(err)
      }
      return res.json(object)
    })
  })
}