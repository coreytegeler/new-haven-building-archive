var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var buildingSchema = mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	slug: String,
	description: {
		type: String,
		require: true
	},
	streetAddress: {
		type: String,
		require: true
	},
	researchBy: {
		type: String,
		require: true
	},
	researchYear: {
		type: String,
		require: true
	},
	dateConstructed: {
		type: String,
		require: true
	},
	architect: {
		type: String,
		require: true
	},
	currentTenant: {
		type: String,
		require: true
	},
	era: {
		type: String,
		require: true
	},
	hood : {
		type: String,
		require: true
	},
	orginalProgram: {
		type: String,
		require: true
	},
	program: {
		type: String,
		require: true
	}
}, { 
	timestamps: true
})

buildingSchema.pre('save', function(next) {
	this.era = tools.getEra(this.dateConstructed)
	tools.preSave(this)
  next()
})

module.exports = mongoose.model('Building', buildingSchema)