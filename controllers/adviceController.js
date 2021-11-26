const AdviceCloneV1 = require('../models/clone_v1/model_advice');

exports.advices = async function(req, res) {
    try {
        const advices = await AdviceCloneV1.find({toolId : req.body.toolId}, {_id : 0, __v : 0}).lean().sort({adviceId: -1});
        res.send(advices);
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.create = async function(req, res) {
    try {
        let update = {
            toolId: req.body.toolId,
            adviceId : req.body.adviceId,
            title: req.body.title,
            content: req.body.content,
            links: req.body.links
        };
    
        let advice = await AdviceCloneV1.findOneAndUpdate({toolId : req.body.toolId, adviceId : req.body.adviceId}, update, {
            new: true,
            upsert: true // Make this update into an upsert
          });
          
        res.send(advice);
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.delete = async function(req, res) {
    try {
        await AdviceCloneV1.deleteOne({adviceId : req.body.adviceId, toolId: req.body.toolId }, function (err, docs) {
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
}