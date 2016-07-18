var tools = require('../tools')
var mongoose = require('mongoose')

var hoodSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String
}, { 
	timestamps: true
});

hoodSchema.pre('save', function(next) {
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Hood', hoodSchema)