const mongoose = require('mongoose');

const votersSchema = new mongoose.Schema({
    user: { type: String },
    votes: { type: [] },
});

module.exports = mongoose.model('Voter', votersSchema);
