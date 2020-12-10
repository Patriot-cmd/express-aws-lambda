const mongoose = require('../dbconnection/mongooseconnection');

var kuralModel = mongoose.model('kural_data',
            new mongoose.Schema({}),
            'kural_data');

module.exports = kuralModel;