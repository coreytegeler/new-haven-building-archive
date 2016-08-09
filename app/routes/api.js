var Async = require('async')
var tools = require('../tools')
module.exports = function(app) {
	app.get('/api/:type/:slug/:format', function(req, res) {
    var type = req.params.type
    var slug = req.params.slug
    var format = req.params.format
    var model = tools.getModel(type)
    var query = {}
    if(!model)
      return res.json(null)
    if(slug != 'all')
      query = {slug: slug}
    model.find(query, function(err, objects) {
      console.log(objects)
      if(err)
        callback(err)
      if(format == 'json')
        return res.json(objects)
      else if(format == 'html')
        return res.render('building.pug', {
          building: objects[0],
        })
    })
  })
}