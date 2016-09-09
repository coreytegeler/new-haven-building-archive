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
	client: {
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
	style: {

	},
	originalUse: {
		type: String
	},
	use: {
		type: String
	},
	research: {
		type: String
	},
	citations: {
		type: String
	},
	images: {
		type: Mixed
	},
	type: String
}, { 
	timestamps: true
})

buildingSchema.pre('save', function(next) {
	if(!this.name)
		this.name = this.address
	this.type = 'building'
	tools.preSave(this)
  next()
})

module.exports = mongoose.model('Building', buildingSchema)