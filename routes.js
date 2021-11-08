const express = require("express");
const Dot = require("./models/model_dot");
const Advice = require("./models/model_advice");
const Spectrum = require("./models/model_spectrum");
const Scenario = require("./models/model_scenario");

bodyParser = require('body-parser');

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.post("/add_dot", async (request, response) => {

    try {
      let req = request.body;
      const dot_id = req.id;
      const update = { 
        size : req.size, 
        position: req.position, 
        color: req.color, 
        bg_color : req.bg_color,
        row: req.row, 
        label: req.label, 
        advice_id : req.advice_id,
        scenario_id : req.scenario_id 
      };

      let dot = await Dot.findOneAndUpdate({id : dot_id}, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      
      response.send(dot);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/delete", async (request, response) => {
    let req = request.body;
    const dot_id = req.id; // get dot_id from req

    try {
      await Dot.findOneAndDelete({ id: dot_id }, function (err, docs) {
          if (err){
              console.log(err)
          }
          else{
            response.sendStatus(200);
          }
      });
      
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/delete_targets", async (request, response) => {
    let req = request.body;
    const advice_id = req.advice_id; // get dot_id from req

    try {
      await Dot.deleteMany({ color: "blue", advice_id : advice_id }, function(err, obj){
        if (err){
            console.log(err)
        }
        else{
          response.sendStatus(200);
        }
      });
    } catch (error) {
      response.status(500).send(error);
    }
});

app.get("/dots", async (request, response) => {
  const scenario_id = request.query.scenario_id;

  try {
    const dots = await Dot.find({scenario_id : scenario_id}).select({}).sort({"id" : -1}).lean();
    const advices = await Advice.find({scenario_id : scenario_id}).select({}).sort({"advice_id" : -1}).lean();

    let dots_with_advice = dots.map(dot => ({
      ...dot,
      "advice_content" : advices.filter(a => a.advice_id === dot.advice_id).map(a => a.advice_content)[0],
      "bg_color" : advices.filter(a => a.advice_id === dot.advice_id).map(a => a.advice_color)[0]
    }));

    response.send(dots_with_advice);
  } catch (error) {
    response.status(500).send(error);
  }
});

//---- advice ---
app.get("/advices", async (request, response) => {
  const scenario_id = request.query.scenario_id;
  
  try {
    const advices = await Advice.find({scenario_id : scenario_id}).select({}).sort({"advice_id" : -1});
    response.send(advices);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/add_advice", async (request, response) => {
    try {
      let req = request.body;
      const advice_id = req.advice_id;
      const update = { advice_content : req.advice_content, scenario_id :  req.scenario_id, advice_color : req.advice_color};

      let advice = await Advice.findOneAndUpdate({advice_id : advice_id}, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      
      response.send(advice);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/delete_advice", async (request, response) => {
    let req = request.body;
    const advice_id = req.advice_id; // get advice_id from req
    const query = { advice_id: advice_id };

    try {
      await Dot.deleteMany(query); 
      await Advice.findOneAndDelete({ advice_id: advice_id }, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
          response.sendStatus(200);
        }
      });
      
    } catch (error) {
      response.status(500).send(error);
    }
});

//-------spectrum ----------

app.get("/spectrums", async (request, response) => {
  const scenario_id = request.query.scenario_id;

  try {
    const spectrums = await Spectrum.find({scenario_id : scenario_id}).select({}).sort({"row_id" : -1});
    response.send(spectrums);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/add_spectrum", async (request, response) => {

    try {
      let req = request.body;
      const row_id = req.row_id;
      const update = { 
          "spectrum_title" : req.spectrum_title, 
          "label_m_100" : req.label_m_100,
          "label_m_50" : req.label_m_50,
          "label_0" : req.label_0,
          "label_p_50" : req.label_p_50,
          "label_p_100" : req.label_p_100,
          "scenario_id" : req.scenario_id
        };

      let spectrum = await Spectrum.findOneAndUpdate({row_id : row_id}, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      
      response.send(spectrum);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/update_spectrum_title", async (request, response) => {

    try {
      let req = request.body;
      const row_id = req.row_id;
      const update = { spectrum_title : req.spectrum_title };

      let spectrum = await Spectrum.findOneAndUpdate({row_id : row_id}, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      
      response.send(spectrum);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/update_spectrum_labels", async (request, response) => {

    try {
      let req = request.body;
      const row_id = req.row_id;
      const update = { 
        label_m_100 : req.label_m_100,
        label_m_50  : req.label_m_50,
        label_0     : req.label_0,
        label_p_50  : req.label_p_50,
        label_p_100 : req.label_p_100,
      };

      let spectrum = await Spectrum.findOneAndUpdate({row_id : row_id}, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      
      response.send(spectrum);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.post("/delete_spectrum", async (request, response) => {
    let req = request.body;
    const row_id = req.row_id; // get advice_id from req
    const query = { row: row_id };
   
    try {
      await Dot.deleteMany(query); 
      await Spectrum.findOneAndDelete({ row_id: row_id }, function (err, docs) {
          if (err){
            console.log(err)
          }
          else{
            
            response.sendStatus(200);
          }
      });
      
    } catch (error) {
      response.status(500).send(error);
    }
});

// scenarios...

app.get("/scenarios", async (request, response) => {
  try {
    const scenarios = await Scenario.find({}).select({}).sort({"scenario_id" : -1});
    response.send(scenarios);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/add_scenario", async (request, response) => {

    try {
      let req = request.body;
      const scenario_id = req.scenario_id;
      const update = { 
          "scenario_id" : req.scenario_id, 
          "scenario_content" : req.scenario_content,
        };

      let scenario = await Scenario.findOneAndUpdate({scenario_id : scenario_id}, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });
      
      response.send(scenario);
    } catch (error) {
      response.status(500).send(error);
    }
});

//
var product  = require('./routes/products');
app.use('/product',product);

var muse  = require('./routes/muse');
app.use('/muse',muse);

module.exports = app;
