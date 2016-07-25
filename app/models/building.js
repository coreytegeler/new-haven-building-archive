var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var buildingSchema = mongoose.Schema({
	streetAddress: {
		type: String,
		require: true
	},
	name: {
		type: String,
	},
	slug: String,
	description: {
		type: String
	},
	researchBy: {
		type: String
	},
	researchYear: {
		type: String
	},
	dateConstructed: {
		type: String
	},
	architect: {
		type: String
	},
	currentTenant: {
		type: String
	},
	era: {
		type: String
	},
	neighborhood: {
		type: String
	},
	originalProgram: {
		type: String
	},
	program: {
		type: String
	}
}, { 
	timestamps: true
})

buildingSchema.pre('save', function(next) {
	this.era = tools.getEra(this.dateConstructed)
	if(!this.name)
		this.name = this. streetAddress
	this.slug = tools.slugify(this.streetAddress, {lower: true})
	// tools.preSave(this)
  next()
})

module.exports = mongoose.model('Building', buildingSchema)