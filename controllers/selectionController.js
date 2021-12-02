const Selection = require('../models/clone_v1/model_selection');

// Display list of all products.
exports.selections = async function(req, res) {
    try {
        const selections = await Selection.find({toolId : req.body.toolId, username : req.body.username},
            {_id : 0, __v : 0, createdAt : 0, updatedAt : 0}).lean();
        const result = selections.map(s => s.selection);
        res.send(result);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.clients = async function(req, res) {
    try {
        const clients = await Selection.aggregate([
            { $group : { _id : "$username", time : {"$last" :  "$updatedAt"}} },
            {
                $sort : { time: -1 }
            }
        ])
        
        res.send(clients);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.create = async function(req, res) {
    try {
        let update = {
            toolId: req.body.toolId,
            username: req.body.username,
            selection: req.body.selection
        };
    
        let selection = await Selection.findOneAndUpdate({
                toolId : req.body.toolId, 
                username : req.body.username, 
                "selection.questionId" : req.body.selection.questionId,
                "selection.optionId" : req.body.selection.optionId,
            }, update, {
            upsert: true // Make this update into an upsert
        });
          
        res.send(selection);
    } catch (error) {
        throw new Error(error.message);
    }
};