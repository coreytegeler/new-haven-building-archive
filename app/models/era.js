var tools = require('../tools')
var mongoose = require('mongoose')

var eraSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String
}, { 
	timestamps: true
});

eraSchema.pre('save', function(next) {
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Era', eraSchema)