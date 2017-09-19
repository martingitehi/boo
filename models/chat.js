var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.SchemaTypes.ObjectId, ref: 'Profile'
    },
    to: {
        type: mongoose.SchemaTypes.ObjectId, ref: 'Profile'
    },
    messages: {
        type: Array, default: []
    },
    status: {
        type: String, required: true, default: 'Unread'
    }
});
module.exports = mongoose.model('Chat', chatSchema)