'use strict';
var fs = require('fs');
var path = require('path');
var Dict = require('../lib/dict');
var argv = require('minimist')(process.argv.slice(2));
//console.dir(argv);

function dump(obj, depth) { 
	var cache = [];
	depth = depth || 3;
	return JSON.stringify(obj, function(key, value) {
		    if (typeof value === 'object' && value !== null) {
		        if (cache.indexOf(value) !== -1) {
		            // Circular reference found, discard key
		            return;
		        }
		        // Store value in our collection
		        cache.push(value);
		    }
		    return value;
		}
	, depth); 
}

// extend class
function createPhrase(dict) {
	var options = { numWords:Math.floor(Math.random()*12)+3 }; // 3-15 random words
	var phrase = dict.createWords(options).join(' ').replace(/  /g, ' ') + '. '; // (each word is already terminated by a space - but don't assume it's always so);
	phrase = phrase.replace(/^(.)/, function(m, m1)  { return m1.toUpperCase(); });
	//phrase[0] = phrase[0].toUpperCase();
	return phrase;
};



var wordaccuracy = 5; // 3=low, 8=nearly perfect, 5=most
var dict = new Dict(wordaccuracy);
var samples = 3;

function loadAndCreate(sourceFile, validator) {
	if (sourceFile.indexOf('.txt')<0)
		sourceFile += '.txt';
	var sourceText = fs.readFileSync(path.join(__dirname, 'samples', sourceFile), {encoding:'utf8'})
	dict.reset();
	dict.learn(sourceText, validator);
	//console.log(dump(dict, 2))
	for (var i=0; i<samples; i++)
		console.log(createPhrase(dict));
}


function klingonValidator(phrase) {
	// trim out all invalid chars
	var reInvalidChars = /[^a-z\']/gi; // uses upper/lower AND '
	var phrase = phrase 
		.replace(reInvalidChars, ' ') // make invalid chars a SPACE
		.replace(/  /g, ' ').trim(); // remove excess whitespace
	return phrase;
};

(function main() {
	const files      = ['essene',  'lorem', 'lorem_en', 'fox', 'sally', 'gpl', 'essene_kl',];
	const validators = [ null   ,   null  ,  null     ,  null,   null,   null,  klingonValidator];

	if (argv._[0]) {
		loadAndCreate(argv._[0]);
	}
	else
	{
		for (var i=0; i<files.length; i++) {
			console.log(files[i])
			loadAndCreate(files[i], validators[i]);
			console.log("\n");
		}
	}	
})();

