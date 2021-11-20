const Question = require('../models/clone_v1/model_question');

// Display list of all products.
exports.questions = async function(req, res) {
    try {
        const questions = await Question.find({toolId : req.body.toolId}, {_id : 0, __v : 0}).lean().sort({displayId: -1});
        res.send(questions);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.create = async function(req, res) {
    try {
        let update = {
            questionId : req.body.questionId,
            toolId: req.body.toolId,
            content: req.body.content,
            displayId : req.body.displayId,
            options: req.body.options
        };
    
        let question = await Question.findOneAndUpdate({toolId : req.body.toolId, questionId : req.body.questionId}, update, {
            new: true,
            upsert: true // Make this update into an upsert
          });
          
        res.send(question);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.delete = async function(req, res) {
    try {
        await Question.deleteOne({questionId : req.body.questionId, toolId: req.body.toolId }, function (err, docs) {
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

exports.reorder =  async function(req, res) {
    try {
       const orders = req.body.orders;

       let bulk = await Question.collection.initializeOrderedBulkOp();
       orders.forEach(function(record){
            bulk.find( { toolId : record.toolId, questionId : record.questionId } ).update( { $set: { displayId: record.displayId }} );
        });
        bulk.execute(async function(err) {
            res.send(orders);
        });
    } catch (error) {
        throw new Error(error.message);
    }
};