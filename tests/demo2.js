const fs = require('fs')
const Wordish = require('../index');
const filename = "samples/gpl.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 15; 
var word = new Wordish(accuracy);
word.learn(fs.readFileSync(filename, {encoding:'utf8'}))

// generate a list of words
var options = { // these options are all optional
	minWordLen: 7,
	maxWordLen: 15,
	numWords: 4 
}
for (var i=0; i<5; i++)
	console.log(word.createWords(options).join(' '));
