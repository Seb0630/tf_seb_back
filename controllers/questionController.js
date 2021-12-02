const Question = require('../models/clone_v1/model_question');
const AdviceCloneV1 = require('../models/clone_v1/model_advice');

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

exports.dots = async function(req, res) {
    try {
        const questions = await Question.find(
            {toolId : req.body.toolId, options : {$elemMatch : { links : { $exists: true, $ne: [] } }}}, 
            {_id : 0}).select({options : 1, questionId : 1}).lean(); 
        
        const advices = await AdviceCloneV1.find(
            {toolId : req.body.toolId,   links : { $exists: true, $ne: []  }}, 
            {_id : 0}).select({links : 1, adviceId : 1, title : 1}).lean(); 

        
        const _adviceTargets = advices.map(a => (
            a.links?.filter(link => link.position !== null).map(ele => ({...ele, adviceTitle: a.title, adviceId: a.adviceId}))
        ))

        const targets = [].concat.apply([],Object.values(_adviceTargets));
        
        const dots = [];
        questions.map(q => (
            q.options.map(option => {
                const dot = option.links?.filter(link => link.value !== null).map(ele => ({...ele,  questionId : q.questionId,
                    optionId : option.optionId}))
                if((dot !== null) && (typeof dot !== 'undefined')){
                    dots.push(dot);
                }
                return dot;
            })
        ))
             
        const dot_array = [].concat.apply([], Object.values(dots));
                    
        let result = {
            targets : targets,
            dots :  dot_array
        }

        res.send(result);
       
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
        //             $set: { "options.$[].links" : {
        //             spectrumId : spectrumId, 
        //             size : 'small', 
        //             value : null, 
        //             color : 'green'} }},
        //         {  multi : true } );
        //     })
        // })

        // await Question.updateMany(
        //     {toolId: req.body.toolId},
        //     {   
        //         $set: { 
        //             "options.$[].links.$[i].color": 'green'
        //         }
        //     }, 
        //     { arrayFilters : [ { "i.color": 'red' } ]}
        // );

        
        spectrumIds.forEach(function(spectrumId){
            bulk.find( { toolId : toolId}).
            update(
                {   $set: { "options.$[].links.$[i]": {
                                    spectrumId : spectrumId, 
                                    size : 'small', 
                                    value : null, 
                                    color : 'red'} }}, {upsert: true, arrayFilters : [ { "i.spectrumId": spectrumId } ]});
        })
       
      
        bulk.execute(async function(err) {
            res.sendStatus(200);
        });

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
        
        // });

    } catch (error) {
        throw new Error(error.message);
    }
};
