var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var tourSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	slug: String,
	brief: {
		type: String
	},
	buildings: Mixed
}, { 
	timestamps: true
});

tourSchema.pre('save', function(next) {
	tools.preSave(this)
	next()
})

module.exports = mongoose.model('Tour', tourSchema)