/**
 * @license GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 **/

 'use strict';
var fs = require('fs');
var path = require('path');
var Dict = require('./index');
var argv = require('minimist')(process.argv.slice(2));

function dirExists(filename) {  try { return fs.statSync(filename).isDirectory(); } catch(e) { return false; } } // node.js has deprecated its fs.exists :(


(function main(argv) {
	// process the options
	if (argv._.length<1 && !argv['stdin']) {
		console.error("Missing required arguments")
		showHelp();
	}

	// read basic options
	var accuracy = 5;
	var numSamples = 1;
	var separator = ' ';
	var options = {

	};
	if (argv['max-len'])
		options.maxWordLen = argv['max-len'];
	if (argv['min-len'])
		options.minWordLen = argv['min-len'];
	if (argv['num-words'])
		options.numWords = argv['num-words'];
	if (argv['num-samples'])
		numSamples = argv['num-samples'];
	if (argv['separator'])
		separator = argv['separator'];
	
	if (argv['accuracy'])
		accuracy = Math.max(2, Math.min(20, argv['accuracy']));

	var sourceText = '';

	if (argv['stdin']) {
		process.stdin.setEncoding('utf8');

		process.stdin.on('readable', function() {
			var chunk;
			while (chunk = process.stdin.read()) {
				sourceText += chunk;
			}
		});

		process.stdin.on('end', function () {
		// There will be a trailing \n from the user hitting enter. Get rid of it.
			processData();
		});
  	}
	else {
		sourceText = fs.readFileSync(argv._[0], {encoding:'utf8'})
		processData();
	}

	function processData() {
		var dict = new Dict(accuracy);
		dict.learn(sourceText);
		while (numSamples--) {
			var words = dict.createWords(options);
			console.log(words.join(separator))
		}
	}



})(require('minimist')(process.argv.slice(2), {
	alias:{
		'a': 'accuracy',
		'n': 'min-len',
		's': 'separator',
		'i': 'num-samples',
		'w': 'num-words', 
		'x': 'max-len'
	}
}))

function showHelp() {
	console.log(
		"USAGE:\n" +
		"\twordish source.txt [options]\n" +
		"\n"+
		"WHERE:\n"+
		"\tsource.txt         A document holding a sample set of words. \n"+
		"\t                       If missing, use --stdin option.\n" +
		"\t--num-words, -w    Number of words to generate. Default is random 5-8 \n" +
		"\t--min-len, -n      Minimum word length. Default is 3\n" +
		"\t--max-len, -x      Maximum word length. Default is 10\n" +
		"\t--accuracy, -a     Word accuracy 2..20. Default is 5. 3 is random, 10 is nearly perfect\n" +
		"\t                       NB: More accuracy increases memory usage\n"+
		"\t--separator, -s    The separator to use. Default is \" \"\n" +
		"\t--num-samples, -i  How many sample sets to generate. Default is 1\n" +
		"\t--stdin            Rather than using 'source.txt', use STDIN\n" +
		"\n" + 
		"eg.\n" + 
		"\twordish tests/samples/lorem.txt -n 8 -a 8\n"+
		"\tcat tests/samples/lorem.txt | wordish --stdin -i 10 -a 20 -s \"-\"\n"+
		"");
	process.exit(-1);
}

