const Tool = require('../models/clone_v1/model_tool');

// Display list of all products.
exports.tools = async function(req, res) {
    try {
        const tools = await Tool.find({}, {_id : 0, __v : 0}).lean().sort({toolId: -1});
        res.send(tools);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.create = async function(req, res) {
    try {
        const update = {
            toolId : req.body.toolId,
            content: req.body.content
        };
    
        let tool = await Tool.findOneAndUpdate({toolId : req.body.toolId}, update, {
            new: true,
            upsert: true // Make this update into an upsert
        });
          
        res.send(tool);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.delete = async function(req, res) {
    try {
        await Tool.deleteOne({toolId : req.body.toolId}, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
              res.sendStatus(200);
            }
        });
    } catch (error) {
        throw new Error(error.message);
    }
};