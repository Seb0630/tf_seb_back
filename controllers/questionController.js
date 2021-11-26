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

exports.setnonelinks = async function(req, res) {
    try {
       const spectrumIds = req.body.spectrumIds;
       const toolId = req.body.toolId;
       const questionIds = req.body.questionIds;

        let bulk = await Question.collection.initializeOrderedBulkOp();
        
        // questionIds.forEach(function(questionId){
        //     spectrumIds.forEach(function(spectrumId){
        //         bulk.find( { toolId : toolId, questionId : questionId}).
        //         update(
        //             { 
        //             $addToSet: { "options.$[].links" : {
        //             spectrumId : spectrumId, 
        //             size : 'small', 
        //             value : null, 
        //             color : 'green'} }},
        //         {  multi : true } );
        //     })
        // })

        await Question.find({toolId: req.body.toolId }).update(
            {   $set: { "options.$[].links.$[i]": {
                             spectrumId : 10, 
                             size : 'small', 
                             value : null, 
                             color : '12'} }}, {upsert: true, arrayFilters : [ { "i.spectrumId": 10 } ]});

        // questionIds.forEach(function(questionId){
        //     spectrumIds.forEach(function(spectrumId){
        //         bulk.find( { toolId : toolId, questionId : questionId}).
        //         update(
        //             {   $set: { "options.$[].links.$[i]": {
        //                              spectrumId : spectrumId, 
        //                              size : 'small', 
        //                              value : null, 
        //                              color : '12efefe'} }}, {upsert: true, arrayFilters : [ { "i.spectrumId": spectrumId } ]});
        //     })
        // })
      
        // bulk.execute(async function(err) {
        //     res.sendStatus(200);
        // });

        // let ttt = spectrumIds.map((spectrumId, i) => ({
            
        //         updateOne: {
        //             filter: {toolId : toolId, questionId : 2},
        //             update: {$set: { "options.$[].links.$[i].color" : 'ee'}},
        //             arrayFilters: [  { "i.spectrumId": spectrumId } ],
        //             upsert: true
        //         }
           
        // }))

        // await Question.collection.bulkWrite(ttt).catch(e => {
        //     console.log(e);
        
        //  });

    } catch (error) {
        throw new Error(error.message);
    }
};
