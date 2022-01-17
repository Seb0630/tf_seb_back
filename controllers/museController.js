var axios = require('axios');
var moment = require('moment');
const Word = require('../models/model_word');
const Stats = require('../models/model_stats');
const Group = require('../models/clone_v1/model_group');

// Display list of all words.
exports.words = async function (req, res) {
    try {
        const pageNumber = req.body.pageNumber;
        const isIndexed = req.body.isIndexed;
        const firstLetter = req.body.firstLetter;

        const words = await Word.find({}, { _id: 0, wordContent: 1 }).lean();
        const wordsIndexed = words.map(w => w.wordContent);

        let ms = [];
        let filter = {};
        if (pageNumber === 0) {
            if (isIndexed) {
                if (firstLetter !== '') {
                    filter = {
                        word: { $in: wordsIndexed, $regex: '^' + firstLetter, $options: 'i' },
                        count: { $gte: 3 }
                    };
                }
                else {
                    filter = {
                        word: { $in: wordsIndexed },
                        count: { $gte: 3 }
                    };
                }
            }
            else {
                if (firstLetter !== '') {
                    filter = {
                        word: { $regex: '^' + firstLetter, $options: 'i' },
                        count: { $gte: 3 }
                    };
                }
                else {
                    filter = {
                        count: { $gte: 3 }
                    };
                }
            }

            ms = await Stats.find(filter).skip(1000 * pageNumber).limit(1000).sort({ count: -1 }).lean();
        }
        else {
            if (isIndexed) {
                if (firstLetter !== '') {
                    filter = {
                        word: { $in: wordsIndexed, $regex: '^' + firstLetter, $options: 'i' },
                        count: { $gte: 3 }
                    };
                }
                else {
                    filter = {
                        word: { $in: wordsIndexed },
                        count: { $gte: 3 }
                    };
                }
            }
            else {
                if (firstLetter !== '') {
                    filter = {
                        word: { $regex: '^' + firstLetter, $options: 'i' },
                        count: { $gte: 3 }
                    };
                }
                else {
                    filter = {
                        count: { $gte: 3 }
                    };
                }

            }
            ms = await Stats.find(filter).skip(1000 * pageNumber).limit(1000).sort({ count: -1 }).lean();
        }

        let result = ms.map(function (entry) {
            let _isIndexed = wordsIndexed.findIndex(w => w === entry.word);
            let record = {
                'count': entry.count,
                'indexed': (_isIndexed !== -1) ? "Yes" : "",
                'word': entry.word
            }
            return record;
        });

        let res_obj = {
            totalCount: result.length,
            rows: result
        };

        res.send(res_obj);

    } catch (error) {
        res.status(500).send(error);
    }
};

exports.groups = async function(req, res){
    try {
        const groups = await Group.find({}).sort({'groupName' : 1}).lean();
        res.send(groups);
    }
    catch (error) {
        res.status(500).send(error);
    } 
}

exports.updateGroup = async function(req, res){
    try {
        const groupName = req.body.groupName;
        const words = req.body.words;

        let update = {
            groupName : groupName, 
            words : words
        };

        let query = {_id : req.body._id};
        if (!query._id) {
            query._id = new mongoose.mongo.ObjectID();
        }

        let group = await Group.findOneAndUpdate(query, update, {
            new: true,
            upsert: true // Make this update into an upsert
          });
          
        res.send(group);
    }
    catch (error) {
        res.status(500).send(error);
    } 
}

exports.groupwords = async function (req, res) {
    try {
        const groupId = req.params.groupId;
        const group = await Group.find({ _id: groupId}).lean();
        const _groupWords = group[0].words;
        const groupWords = group[0].words.map(ele => ele.word);
        const groupName = group[0].groupName;

        const _words = await Word.find({}, { _id: 0, wordContent: 1 }).lean();
        const wordsIndexed = _words.map(w => w.wordContent);

        const result = await Word.aggregate([ 
            {
                $match : { wordContent : { $in : groupWords}}
            },
            { $project : {items : {$concatArrays: ["$relatedWordsGoogle", "$relatedWordsWiki"]}}},
            { $unwind : "$items"}, 
            { $group: {_id : "$items.word", total_score : {$sum : "$items.score"},  count : {$sum: 1} }}]).limit(5000).sort({total_score: -1});

        let words = result.map(function (entry) {
            let _isIndexed = wordsIndexed.findIndex(w => w === entry._id);
            let record = {
                'count': entry.count,
                'indexed': (_isIndexed !== -1) ? "Yes" : "",
                'totalscore' : entry.total_score,
                'word': entry._id
            }
            return record;
        });
        
        let response = {
            groupName : groupName,
            groupWords : _groupWords,
            words: words
        };

        res.send(response);
    }
    catch (error) {
        res.status(500).send(error);
    }
};

async function getStatsByWord(wordIndexed) {
    const google_words1 = wordIndexed.relatedWordsGoogle.map(w => w.word);
    const wiki_words1 = wordIndexed.relatedWordsWiki.map(w => w.word);
    let mergedWords1 = [...new Set([...google_words1, ...wiki_words1])];

    const words = await Word.find({}, { _id: 0, wordContent: 1 });
    const words_array = words.map(w => w.wordContent);

    const statsIndexed = await Stats.find({ word: { $in: mergedWords1 } }, { word: 1, count: 1, _id: 0 }).lean();
    let statsObjArray = [];
    statsIndexed.forEach(function (entry) {
        let isIndexed = words_array.includes(entry.word) ? "Yes" : '';
        let searched_google = (wordIndexed.relatedWordsGoogle).find(w => w.word === entry.word);
        let searched_wiki = (wordIndexed.relatedWordsWiki).find(w => w.word === entry.word);
        let google_score = null;
        let wiki_score = null;

        if (typeof searched_google !== 'undefined') {
            google_score = searched_google.score;
        }
        else {
            google_score = '';
        }

        if (typeof searched_wiki !== 'undefined') {
            wiki_score = searched_wiki.score;
        }
        else {
            wiki_score = '';
        }

        let obj = {
            word: entry.word,
            count: entry.count,
            googleScore: google_score,
            wikiScore: wiki_score,
            googleIndexed: moment(wordIndexed.createdAt).format("YYYY-MM-DD HH:mm"),
            wikiIndexed: moment(wordIndexed.createdAt).format("YYYY-MM-DD HH:mm"),
            isIndexed: isIndexed
        }

        statsObjArray.push(obj);
    });
    statsObjArray.sort((a, b) => parseInt(b.count) - parseInt(a.count));
    return statsObjArray;
}

exports.create = async function (req, res) {
    try {
        const keyword = req.params.word_content;
        // GOOGLE BOOKS MODE
        var options_google = {
            'method': 'GET',
            'url': encodeURI('https://api.datamuse.com/words?ml=' + keyword + '&max=1000'),
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        // WIKIPEDIA MODE
        var options_wiki = {
            'method': 'GET',
            'url': encodeURI('https://api.datamuse.com/words?ml=' + keyword + '&v=enwiki&max=1000'),
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        // specific keyword already exists in db.
        const wordIndexed = await Word.find({ wordContent: keyword }, { _id: 0 }).lean();
        if (wordIndexed.length > 0) {
            let result = await getStatsByWord(wordIndexed[0]);
            res.send(result);
        }
        else {
            const result_google = await axios(options_google);
            const result_wiki = await axios(options_wiki);

            const google_words = result_google.data.map(w => w.word);
            const wiki_words = result_wiki.data.map(w => w.word);

            // save new word into words collection
            const newWord = new Word({
                relatedWordsGoogle: result_google.data,
                relatedWordsWiki: result_wiki.data,
                wordContent: keyword
            });
            const wordSaved = await newWord.save();


            const google_words_info = result_google.data.map((w, i) => ({ word: w.word, google_score: w.score, position: i }));
            const wiki_words_info = result_wiki.data.map((w, i) => ({ word: w.word, wiki_score: w.score, position: i }));

            // non-duplicate words after merging google words and wiki words(words from new datamuse API calls) - Array B
            let mergedWords = [...new Set([...google_words, ...wiki_words])];
            // console.time('time to get intersection');
            // console.log("mergedWords length: " + mergedWords.length);
            // Intersection words between  Array A and Array B
            let intersection_words = await Stats.find({ word: { $in: mergedWords } }).select({ word: 1, _id: 0 }).distinct('word').lean()
            //   console.timeEnd('time to get intersection');
            //The difference will output the elements from array A that are not in the array B.
            // difference words
            let difference_words = mergedWords.filter(x => !intersection_words.includes(x));

            let newRecords = [];
            difference_words.forEach(function (word) {
                let sum_position = 0;
                let count = 0;
                // searching in google words firstly
                let word_google_matched = google_words_info.find(w => w.word === word);
                if (typeof word_google_matched !== 'undefined') { // found
                    sum_position = word_google_matched.position;
                    count++;
                }

                // searching in wiki words secondly
                let word_wiki_matched = wiki_words_info.find(w => w.word === word);
                if (typeof word_wiki_matched !== 'undefined') { // found
                    sum_position += word_wiki_matched.position;
                    count++;
                }

                let stat_object = {
                    word: word,
                    sum_pos: sum_position,
                    count: count,
                };

                newRecords.push(stat_object);
            });
            const result = await Stats.insertMany(newRecords);
            // this option prevents additional documents from being inserted if one fails
            let existingRecords = [];
            intersection_words.forEach(function (word) {
                let sum_position = 0;
                let count = 0;
                // searching in google words firstly
                let word_google_matched = google_words_info.find(w => w.word === word);
                if (typeof word_google_matched !== 'undefined') { // found
                    sum_position = word_google_matched.position;
                    count++;
                }
                // searching in wiki words secondly
                let word_wiki_matched = wiki_words_info.find(w => w.word === word);
                if (typeof word_wiki_matched !== 'undefined') { // found
                    sum_position += word_wiki_matched.position;
                    count++;
                }

                let obj = {
                    word: word,
                    count: count,
                    sum_position: sum_position
                }
                existingRecords.push(obj);
            });

            let bulk = await Stats.collection.initializeOrderedBulkOp();
            existingRecords.forEach(function (record) {
                bulk.find({ word: record.word }).update({ $inc: { count: record.count, sum_pos: record.sum_position } });
            });
            bulk.execute(async function (err) {
                let rs = await getStatsByWord(wordSaved);
                res.send(rs);
            });
        }

    } catch (error) {
        throw new Error(error.message);
    }
};

exports.delete = async function (req, res) {
    try {
        await Word.findOneAndDelete({ 'wordContent': req.params.word_content }, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                res.sendStatus(200);
            }
        });

    } catch (error) {
        throw new Error(error.message);
    }
};