var tools = require('../tools')
var mongoose = require('mongoose')
var Mixed = mongoose.Schema.Types.Mixed

var buildingSchema = mongoose.Schema({
	address: {
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
	tour: {
		type: Mixed
	},
	originalUse: {
		type: String
	},
	use: {
		type: String
	},
	type: String
}, { 
	timestamps: true
})

buildingSchema.pre('save', function(next) {
	this.era = tools.getEra(this.dateConstructed)
	if(!this.name)
		this.name = this. address
	this.slug = tools.slugify(this.streetAddress, {lower: true})
	this.type = 'building'
	// tools.preSave(this)
  next()
})

module.exports = mongoose.model('Building', buildingSchema)