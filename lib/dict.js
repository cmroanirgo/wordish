/**
 * GPLv3
 * Copyright (c) 2017 Craig Monro (cmroanirgo). All rights reserved.
 **/
// A simple lookup system, recursively mapping:
//  	a letter/character to it's usage
//		a child 'dictionary' of characters that follow it.
'use strict';

var _hasWindow = typeof window !== 'undefined';
if (!_hasWindow)
	var crypto = require('crypto');


function extend(origin) { // copied from electron-api-demos/node_modules/glob/glob.js & then hacked to oblivion
	// now, you can keep extending, by using
	// _.extend(origin, data1, data2, data3) & all options will be added onto origin only.
	// The 'rightmost' value of a key will be applied.

	for (var a=1; a<arguments.length; a++) {
		var add = arguments[a];
		if (add === null || typeof add !== 'object')
			continue;

		var keys = Object.keys(add)
		var i = keys.length
		while (i--) {
			origin[keys[i]] = add[keys[i]]
		}
	}

	return origin
}

var _defaultCreateOptions = {
	numWords: 8,
	minWordLen: 3,
	maxWordLen: 10,
	randomizer: new Randomizer()
};


/////////////////////////////////////////////////////
//

function Dict() {
	this.totalUsage = 0;
	this.items = { }; // a map eg. 'a'->DictItem
	this.depth = 0;
}

Dict.prototype._addChar = function(char) { // a 'learn-mode' function
	var di = this.items[char];
	if (!di) {
		di = new DictItem(char);
		this.items[char] = di;
	}
	di.usage++;
	this.totalUsage++;
	return di;
};

Dict.prototype._addWords = function(word, root) { // a 'learn-mode' function
	// eg. the string 'Word', adds/updates the following in to this.items:
	// { // DictItem
	// 	char: 'W',
	// 	usage: ...,
	// 	items: { // DictItem
	// 		char: 'o',
	// 		usage: ..., 
	// 		items: { // DictItem
	// 			char: 'r',
	// 			usage: ...,
	// 			items: { // DictItem
	// 				char: 'd',
	// 				usage: ...
	// 				items: {
	// 					char: ' ',
	// 					...
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// BUT, if maxDepth is (eg 3, the default):

	// { // DictItem
	// 	char: 'W',
	// 	usage: ...,
	// 	items: { // DictItem
	// 		char: 'o',
	// 		usage: ..., 
	// 		items: { // DictItem
	// 			char: 'r',
	// 			usage: ...,
	// 		}
	// 	}
	// },
	// { // DictItem
	// 	char: 'd',
	// 	usage: ...
	// 	items: {
	// 		char: ' ',
	// 		...
	// 	}
	// }


	var dict = this;
	for (var i = 0; i < word.length; i++) {
		var di = dict._addChar(word[i]);
		if (word[i]==' ')// if a word just ended, then start again at root
			dict = root;
		else if (dict.depth>=root.maxDepth)// don't let the tree get too deep! 
		
		{
			dict = dict.parent || root;	// easy method. Go up one level (or start again at root)
			if (i>0) {
				// method. find the previous letter as a child of the root element and continue from there
				var di = root.get(word[i]);
				if (di) // have we added this letter to the root chain yet?
					dict = di._getSubItems(root);
				// else. Nope. use a parent dict instead
			}
		}
		else
			dict = di._getSubItems(dict); 
	};
};

Dict.prototype._seek = function(ith) {
	ith = Math.floor(ith);
	var usage = 0;
	var di = null;
	for (var key in this.items) {
		di = this.items[key];
		usage += di.usage;
		if (ith<=usage)
			return di;
	}
	return di; // return the last element, or null
};

/*
Dict.prototype.closestLetter = function(letter) {
	var di = this.items[letter];
	if (!di && this.parent)
		return this.parent.closestLetter(letter);
	return di;
};
*/
Dict.prototype.get = function(letter) {
	return this.items[letter];
};

Dict.prototype._createLetter = function(prevLetter, randomizer, root) {
	var ith = randomizer.generate(0, this.totalUsage); // generate a random# bewtween 0 & the total#chars collected
	var di = this._seek(ith); // find the letter
	if (!di) { // no child characters! Return to the root and continue
		/*var dict = this.parent; // ...the dictionary of the previous letter
		if (dict && dict.parent) // _seek the previous letter in the grandparent's nodes (the parent of the parent)
			dict = dict.parent;
		else
			dict = root; // start at the top, as if it's a new word :O
		di = dict.closestLetter(prevLetter);
		*/
		var dict = root; // _seek the previous letter in the root level
		di = dict.get(prevLetter);

		if (!!di) { // found the previous letter that we can try again with
			dict = di._getSubItems(dict);
			if (dict==this) // uh oh! found ourselves again! just generate a random#
				return root._createLetter(prevLetter, randomizer, root);
			return dict._createLetter(prevLetter, randomizer, root);
		}
		return ''; // abort. can't generate another after the previous letter
	}

	if (!di || di.char == ' ')
		return ''; // stop recursing
	var subword = di._getSubItems(this)._createLetter(di.char, randomizer, root); // recurse
	return di.char + subword;
};

/////////////////////////////////////////////////////
//
function RootDict(max_depth) {
	Dict.call(this);
	this.maxDepth = max_depth || 5; // only generate a usage tree of 5 consecutive letters
}
extend(RootDict.prototype, Dict.prototype);

RootDict.prototype.reset = function() {
	this.totalUsage = 0;
	this.items = { }; // a map eg. 'a'->DictItem
};
RootDict.prototype.createWord = function(options) {
	options = extend({}, _defaultCreateOptions, options);
	if (options.minWordLen>=options.maxWordLen)
		throw new Error("Minimum word length ("+options.minWordLen+") should be shorter than the maximum word length ("+options.maxWordLen+")")
	var word;
	do {
		word = this._createLetter(' ', options.randomizer, this).trim();
	} while (word.length<options.minWordLen || word.length>options.maxWordLen);
	return word;
};

RootDict.prototype.createWords = function(options) {
	options = extend({}, _defaultCreateOptions, options);
	var words = [];
	var numWords = options.numWords;
	while (numWords-->0){
		var stop = 100; // 100 attempts to find unique words 
		do
		{
			var w = this.createWord(options);
		} while (words.indexOf(w)>=0 && stop-->0)

		words.push(w);
	}
	return words;
};


function defaultValidator(phrase) {
	// trim out all invalid chars
	var phrase = phrase.toLowerCase() // ignore case
		.replace(/[^a-z]/gi, ' ') // make invalid chars a SPACE
		.replace(/(?:and|an|or|the)/gi, ' ')// trim *very* common words
		.replace(/  /g, ' ').trim(); // remove excess whitespace
	return phrase;
};

RootDict.prototype.learn = function(phrase, validator) {
	if (!validator)
		validator = defaultValidator;
	phrase = validator.call(this, phrase);
	this._addWords(phrase, this);
};


////////////////////////////////////////////
//
function DictItem(char) {
	this.char = char;
	this.usage = 0;
	// this.items = type of Dict()
}
DictItem.prototype._getSubItems = function(owner) {
	if (!this.items) {
		this.items = new Dict();
		this.items.parent = owner;
		this.items.depth = owner.depth + 1;
	}
	return this.items;
};


/////////////////////////////////////////////
//
function Randomizer(stack_size) {
	// a simple wrapper to use crypto secure
	this.rand = [];
	this.at = 0;
	stack_size = stack_size || 40;
	stack_size += 4-(stack_size%4); // round up to 32bits

	if (_hasWindow) {
		this.values = new Uint8Array(stack_size);
		window.crypto.getRandomValues(this.values); // redo the crypto
	}
	else
	{
		this.values = crypto.randomBytes(stack_size);
	}
}
Randomizer.prototype.generate = function(min, max) {
	if (this.at>=this.values.length)
	{
		 // redo the crypto
		if (_hasWindow)
			window.crypto.getRandomValues(this.values);
		else
			this.values = crypto.randomBytes(this.values.length);

		this.at = 0;
		//console.log('generated: ' + JSON.stringify(this.values))
	}
	var val = this.values[this.at++] | (this.values[this.at++] << 8) | (this.values[this.at++] << 16) | (this.values[this.at++] << 24); // node spits out 
	val = val >>>0; // make UInt32
	var MAX_RAND = 0xffffffff>>>0;
	val = val*(max-min)/MAX_RAND + min;
	if (val>max) val=max;
	return val;
};

module.exports = RootDict;
