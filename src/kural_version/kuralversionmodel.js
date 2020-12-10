const mongoose = require('../dbconnection/mongooseconnection');

var kuralVersionModel = mongoose.model('kural_version',
            new mongoose.Schema({}),
            'kural_version');

module.exports = kuralVersionModel;