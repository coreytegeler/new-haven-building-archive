var tools = require('../tools')
var mongoose = require('mongoose')

var neighborhoodSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String
}, { 
	timestamps: true
});

neighborhoodSchema.pre('save', function(next) {
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Neighborood', neighborhoodSchema)