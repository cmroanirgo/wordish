const fs = require('fs')
const Wordish = require('../index');
const filename = "samples/gpl.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 5; // from 2 to 20..ish. 10 is very accurate, 2 is very random/ gibberish
var word = new Wordish(accuracy);
word.addPhrase(fs.readFileSync(filename, {encoding:'utf8'}))

// generate a list of words
var options = { // these options are all optional
	minWordLen: 5,
	maxWordLen: 10,
	numWords: 10 // defaults to a random selection of 5-8
}
console.log(word.createWords(options).join('-'));