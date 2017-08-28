var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var profileSchema = new mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	about: { type: String, required: true },
	fullname: { type: String, required: true },
	avatar_url: { type: String, required: true },
	dob: { type: Date, required: true },
	career: { type: String, required: false },
	promo_code: { type: String, required: false },
	nationality: { type: String, required: true },
	physique: {
		height: { type: Number, required: false },
		weight: { type: Number, required: false },
		complexion: { type: String, required: true }
	},
	gender: { type: String, required: true },
	location: { type: String, required: true },
	contact: {
		email: { type: String, required: true },
		mobile: { type: String, required: true }
	},
	relationships: {
		status: { type: String, required: true },
		goal: { type: String, required: true },
		family: {
			has_kids: { type: Boolean, required: true },
			no_of_kids: { type: Number, required: true, default: 0 }
		}
	},
	lifestyle: {
		drinks: { type: String, required: true },
		smokes: { type: String, required: true },
	},
	health: {
		hiv_status: {
			status: { type: String, required: true },
			last_tested: { type: Date, required: true }
		},
		disability: {
			is_disabled: { type: Boolean, required: true, default: false },
			disability_type: { type: String, required: true }
		}
	},
	interests: {
		sex: { type: String, required: true },
		others: { type: Array, required: false }
	},
	social: {
		fb: { type: String },
		instagram: { type: String }
	},
	created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);