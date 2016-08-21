var Async = require('async')
var tools = require('../tools')
querystring = require('querystring');
module.exports = function(app) {
	app.get('/api/*', function(req, res) {
    var type = req.query.type
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