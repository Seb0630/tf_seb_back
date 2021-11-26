const SpectrumCloneV1 = require('../models/clone_v1/model_spectrum');
const Question = require('../models/clone_v1/model_question');
const AdviceCloneV1 = require('../models/clone_v1/model_advice');

// Display list of all products.
exports.spectrums = async function(req, res) {
    try {
        const spectrums = await SpectrumCloneV1.find({toolId : req.body.toolId}, {_id : 0, __v : 0}).lean().sort({spectrumId: -1});
        res.send(spectrums);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.create = async function(req, res) {
    try {
        let update = {
            spectrumId : req.body.spectrumId,
            toolId: req.body.toolId,
            content: req.body.content,
            label_m_100: req.body.label_m_100,
            label_m_50 : req.body.label_m_50,
            label_0 :  req.body.label_0,
            label_p_50 : req.body.label_p_50,
            label_p_100 : req.body.label_p_100
        };
    
        let spectrum = await SpectrumCloneV1.findOneAndUpdate({toolId : req.body.toolId, spectrumId : req.body.spectrumId}, update, {
            new: true,
            upsert: true // Make this update into an upsert
          });
          
        res.send(spectrum);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.delete = async function(req, res) {
    try {
        await Question.updateMany({toolId: req.body.toolId },
            { $pull: { "options.$[].links": { spectrumId : req.body.spectrumId } } }, { multi: true });
        
        await AdviceCloneV1.updateMany({toolId: req.body.toolId },
            { $pull: { "links": { spectrumId : req.body.spectrumId } } }, { multi: true });

        await SpectrumCloneV1.deleteOne({spectrumId : req.body.spectrumId, toolId: req.body.toolId }, function (err, docs) {
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