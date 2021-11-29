var axios = require('axios');
var moment = require('moment');
const Word = require('../models/model_word');
const Stats = require('../models/model_stats');

// Display list of all words.
exports.words = async function(req, res) {
    try {
        const words = await Word.find({}, { _id: 0, wordContent: 1 });
        const words_array = words.map(w => w.wordContent);
        const ms = await Stats.find({}).lean();
        
        let result = ms.map(function(entry){
            const isIndexed = words_array.includes(entry.word)? "Yes" : '';
            let record = {
                'count' : entry.count,
                'power' :  parseInt(entry.sum_pos / entry.count),
                'score' : Number((entry.count + entry.count * (1000 - parseInt(entry.sum_pos / entry.count)) / 1000).toFixed(2)),
                'indexed' : isIndexed,
                'word' : entry.word
            }
            return record;
        });
        
        result.sort((a, b) => parseInt(b.score) - parseInt(a.score));
        res.send(result);
        
    } catch (error) {
        res.status(500).send(error);
    }
};

async function  getStatsByWord(wordIndexed){
    const google_words1 = wordIndexed.relatedWordsGoogle.map(w => w.word);
    const wiki_words1   = wordIndexed.relatedWordsWiki.map(w => w.word);
    let mergedWords1 = [...new Set([...google_words1, ...wiki_words1])]; 

    const words = await Word.find({}, { _id: 0, wordContent: 1 });
    const words_array = words.map(w => w.wordContent);
    
    const statsIndexed = await Stats.find( { word: { $in: mergedWords1 } },{word : 1,count :1, _id : 0} ).lean();
    let statsObjArray = [];
    statsIndexed.forEach(function(entry){
        let isIndexed = words_array.includes(entry.word)? "Yes" : '';
        let searched_google = (wordIndexed.relatedWordsGoogle).find(w => w.word === entry.word);
        let searched_wiki = (wordIndexed.relatedWordsWiki).find(w => w.word === entry.word);
        let google_score = null;
        let wiki_score = null;
        
        if(typeof searched_google !== 'undefined' ){
            google_score = searched_google.score;
        }
        else{
            google_score = '';
        }

        if( typeof searched_wiki !== 'undefined'){
            wiki_score = searched_wiki.score;
        }
        else{
            wiki_score = '';
        }

        let obj = {
            word : entry.word,
            count : entry.count,
            googleScore : google_score,
            wikiScore : wiki_score,
            googleIndexed : moment(wordIndexed.createdAt).format("YYYY-MM-DD HH:mm"),
            wikiIndexed : moment(wordIndexed.createdAt).format("YYYY-MM-DD HH:mm"),
            isIndexed : isIndexed
        }

        statsObjArray.push(obj);
    });
    statsObjArray.sort((a, b) => parseInt(b.count) - parseInt(a.count));
    return statsObjArray;
}

exports.create = async function(req, res) {
    try {
        const keyword = req.params.word_content;
        // GOOGLE BOOKS MODE
        var options_google = {
            'method': 'GET',
            'url': 'https://api.datamuse.com/words?ml=' + keyword + '&max=1000',
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        // WIKIPEDIA MODE
        var options_wiki = {
            'method': 'GET',
            'url': 'https://api.datamuse.com/words?ml=' + keyword + '&v=enwiki&max=1000',
            'headers': {
                'Content-Type': 'application/json'
            }
        };
         // specific keyword already exists in db.
        const wordIndexed = await Word.find({wordContent : keyword},{_id : 0}).lean();
        if(wordIndexed.length > 0){
            let result = await getStatsByWord(wordIndexed[0]);
            res.send(result);
        }
        else{
            
            const result_google = await axios(options_google);
            const result_wiki = await axios(options_wiki);
            
            const keywords_ = await Stats.find({},{word : 1}).lean();
            const keywords = keywords_.map(w => w.word);

            const google_words = result_google.data.map(w => w.word);
            const wiki_words   = result_wiki.data.map(w => w.word);

            // save new word into words collection
            const newWord = new Word({
                relatedWordsGoogle : result_google.data,
                relatedWordsWiki : result_wiki.data,
                wordContent : keyword
            });
            const wordSaved = await newWord.save();

            const google_words_info = result_google.data.map((w,i) => ({word : w.word, google_score : w.score, position: i}));
            const wiki_words_info   = result_wiki.data.map((w,i) => ({word : w.word, wiki_score : w.score, position: i}));

            // non-duplicate words after merging google words and wiki words(words from new datamuse API calls) - Array B
            let mergedWords = [...new Set([...google_words, ...wiki_words])]; 

            // Intersection words between  Array A and Array B
            let intersection_words = mergedWords.filter(x => keywords.includes(x));

            //The difference will output the elements from array A that are not in the array B.
            // difference words
            let difference_words = mergedWords.filter(x => !keywords.includes(x));
            
            let newRecords = [];
            difference_words.forEach(function(word){
                let sum_position = 0;
                let count = 0;
                // searching in google words firstly
                let word_google_matched = google_words_info.find(w => w.word === word);
                if (typeof word_google_matched !== 'undefined'){ // found
                    sum_position = word_google_matched.position;
                    count++;
                }

                // searching in wiki words secondly
                let word_wiki_matched = wiki_words_info.find(w => w.word === word);
                if (typeof word_wiki_matched !== 'undefined'){ // found
                    sum_position += word_wiki_matched.position;
                    count++;
                }

                let stat_object = {
                    word : word,
                    sum_pos : sum_position,
                    count : count,
                };

                newRecords.push(stat_object);
            });
            const result = await Stats.insertMany(newRecords);
            // this option prevents additional documents from being inserted if one fails
            let existingRecords = [];
            intersection_words.forEach(function(word){
                let sum_position = 0;
                let count = 0;
                // searching in google words firstly
                let word_google_matched = google_words_info.find(w => w.word === word);
                if (typeof word_google_matched !== 'undefined'){ // found
                    sum_position = word_google_matched.position;
                    count++;
                }
                // searching in wiki words secondly
                let word_wiki_matched = wiki_words_info.find(w => w.word === word);
                if (typeof word_wiki_matched !== 'undefined'){ // found
                    sum_position += word_wiki_matched.position;
                    count++;
                }

                let obj = {
                    word : word,
                    count : count,
                    sum_position : sum_position
                }
                existingRecords.push(obj);
            });
     
            let bulk = await Stats.collection.initializeOrderedBulkOp();
            existingRecords.forEach(function(record){
                bulk.find( { word : record.word } ).update( { $inc: { count: record.count, sum_pos : record.sum_position } } );
            });
            bulk.execute(async function(err) {
                let rs = await getStatsByWord(wordSaved);
                res.send(rs);
            });
        }
     
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.delete = async function(req, res) {
    try {
        await Word.findOneAndDelete({ 'wordContent' : req.params.word_content }, function (err, docs) {
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