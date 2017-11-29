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

var _defaultLearnOptions = {
	minWordLen: 0,
	maxWordLen: 25,
	validator: defaultValidator
};
var _defaultCreateOptions = {
	numWords: 4,
	randomizeNumWords: 1,
	minWordLen: 5,
	maxWordLen: 10,
	randomizer: new Randomizer()
};


/////////////////////////////////////////////////////
//

function Dict() {
	this._totalUsage = 0;
	this._items = { }; // a map eg. 'a'->DictItem
	this._depth = 0;
}

Dict.prototype._addChar = function(char) { // a 'learn-mode' function
	var di = this._items[char];
	if (!di) {
		di = new DictItem(char);
		this._items[char] = di;
	}
	di.usage++;
	this._totalUsage++;
	return di;
};

Dict.prototype._addWords = function(word, root) { // a 'learn-mode' function
	// eg. the string 'Word', adds/updates the following in to this._items:
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
		else if (dict._depth>=root._maxDepth)// don't let the tree get too deep! 
		
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

Dict.prototype._seek = function(ith) { // zero based, maximum == _totalUsage-1
	ith = Math.floor(ith);
	var usage = 0;
	var di = null;
	for (var key in this._items) {
		di = this._items[key];
		usage += di.usage;
		if (ith<usage)
			return di;
	}
	return di; // return the last element, or null
};

Dict.prototype._closestDictWithLetter = function(letter, skip) {
	skip = skip || 0;
	var dict = this;
	var ret = null;
	var di = null;
	do {
		di = dict._items[letter];
		if (skip<=0 && !!di)
			ret = dict; // found the letter
		dict = dict.parent;
		
	} while((skip-->0 || !ret) && !!dict)
	return ret;
};

Dict.prototype.get = function(letter) {
	return this._items[letter];
};

Dict.prototype._createLetter = function(currentWord, randomizer, root, options) {
	// This is great, *but* allows using too many smaller words concatenated. eg. "i it be him" -> "iitbehim"
	// use .learn(, {minWordLen:4}) to control this
	var prevLetter = currentWord.length ? currentWord[currentWord.length-1] : '';
	var di = null;
	if (this._totalUsage>0) {
		var ith = randomizer.generate(0, this._totalUsage-1); // generate a random# between 0 & the total#chars collected
		di = this._seek(ith); // find the letter
	}
	if ((!di || di.char == ' ') && currentWord.length < options.minWordLen) {
		// normally, we should end this word...
		if (prevLetter.length && this.parent != root) {
			// if the letter previously chosen wasn't from the root level. seek upwards to try and continue making a word-ish
			// ie. try again using the same previous letter, but on a different word tree
			var prevdict = this._closestDictWithLetter(prevLetter, 2);
			if (prevdict) {
				var prevdi = prevdict.get(prevLetter);
				return prevdi._getSubItems(prevdict)._createLetter(currentWord, randomizer, root, options)
			}
		}
		
		// ignore what we had for a previous letter. Start again from the root
		return root._createLetter(currentWord, randomizer, root, options);
	}

	if (!di || di.char == ' ')
		return ''; // stop recursing. our word is long enough

	var subword = di._getSubItems(this)._createLetter(currentWord+di.char, randomizer, root, options); // recurse
	return di.char + subword;

	// var ith = randomizer.generate(0, this._totalUsage-1); // generate a random# between 0 & the total#chars collected
	// var di = this._seek(ith); // find the letter
	// if (!di) { // no child characters! Return to the root and continue
	// 	/*var dict = this.parent; // ...the dictionary of the previous letter
	// 	if (dict && dict.parent) // _seek the previous letter in the grandparent's nodes (the parent of the parent)
	// 		dict = dict.parent;
	// 	else
	// 		dict = root; // start at the top, as if it's a new word :O
	// 	di = dict.closestLetter(prevLetter);
	// 	*/
	// 	var dict = root; // _seek the previous letter in the root level
	// 	di = dict.get(prevLetter);

	// 	if (!!di) { // found the previous letter that we can try again with
	// 		dict = di._getSubItems(dict);
	// 		if (dict==this) // uh oh! found ourselves again! just generate a random#
	// 			return root._createLetter(currentWord, randomizer, root);
	// 		return dict._createLetter(currentWord, randomizer, root);
	// 	}
	// 	return ''; // abort. can't generate another after the previous letter
	// }

	// if (!di || di.char == ' ') {
	// 	// ran out of letters to use. 
	// 	return ''; // stop recursing
	// }
	// var subword = di._getSubItems(this)._createLetter(currentWord+di.char, randomizer, root, options); // recurse
	// return di.char + subword;
};

/////////////////////////////////////////////////////
//
function RootDict(max_depth) {
	Dict.call(this);
	this._maxDepth = max_depth || 5; // only generate a usage tree of 5 consecutive letters
}
extend(RootDict.prototype, Dict.prototype);

RootDict.prototype.reset = function() {
	this._totalUsage = 0;
	this._items = { }; // a map eg. 'a'->DictItem
};
RootDict.prototype.createWord = function(options) {
	options = extend({}, _defaultCreateOptions, options);
	if (options.minWordLen>=options.maxWordLen)
		throw new Error("Minimum word length ("+options.minWordLen+") should be shorter than the maximum word length ("+options.maxWordLen+")")
	var word=null, attempts=50;
	do {
		word = this._createLetter('', options.randomizer, this, options).trim();
	} while ((word.length<options.minWordLen || word.length>options.maxWordLen) && attempts-->0);
	return word;
};

RootDict.prototype.createWords = function(options) {
	options = extend({}, _defaultCreateOptions, options);
	var words = [];
	var numWords = options.numWords + (options.randomizeNumWords>0 ? rand(0, options.randomizeNumWords): 0);
	while (numWords-->0){
		var attempts = 50; // 50 attempts to find unique words 
		do
		{
			var w = this.createWord(options);
			if (!w || !w.length)
				attempts = 0; // can't make a word! abort
		} while (words.indexOf(w)>=0 && attempts-->0)
		if (!attempts)
			throw new Error("Not enough source text to generate a word. Decrease accuracy &/or required word length or add more words");
		words.push(w);
	}
	return words;
};


function defaultValidator(phrase) {
	// trim out all invalid chars
	var phrase = phrase.toLowerCase() // ignore case
		.replace(/[^a-z]/gi, ' ') // make invalid chars a SPACE
		.replace(/\b(?:and|an|or|the)\b/gi, ' ')// trim *very* common words
		.replace(/ {2,}/g, ' ').trim(); // remove excess whitespace
	return phrase;
};

RootDict.prototype.learn = function(phrase, options) {
	options = options || {};
	if (typeof options === 'function')
		options = { validator: options };
	options = extend({}, _defaultLearnOptions, options);

	// perform basic validation on the input string (eg. remove nonword chars, convert to lowercase)
	if (options.validator)
		phrase = options.validator.call(this, phrase);

	// build a regExp to exclude all words < options.minWordLen and >options.maxWordLen
	if (options.minWordLen>0) {
		var minStr = "(?:^| )([^ ]{1," + Math.max(0,options.minWordLen-1) + "})(?=$| )"
		var reMin = new RegExp(minStr, "gi");
		phrase = phrase.replace(reMin, ' ');
	}
	if (options.maxWordLen>0) {
		var maxStr = "(?:^| )([^ ]{" + (options.maxWordLen+1) + ",})(?=$| )"
		var reMax = new RegExp(maxStr, "gi");
		phrase = phrase.replace(reMax, ' ');
	}
	phrase = phrase.replace(/ {2,}/g, ' ').trim();

	// add what's left to our dictionary
	this._addWords(phrase, this);
	return phrase;
};


////////////////////////////////////////////
//
function DictItem(char) {
	this.char = char;
	this.usage = 0;
	// this._items = type of Dict()
}
DictItem.prototype._getSubItems = function(owner) {
	if (!this._items) {
		this._items = new Dict();
		this._items.parent = owner;
		this._items._depth = owner._depth + 1;
	}
	return this._items;
};


/////////////////////////////////////////////
//
function rand(from, to) {
	var r = new Randomizer(1);
	return r.generate(from, to); 
}
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
	val = val*(max+1-min)/MAX_RAND + min; // max+1, because we want to 'hit' the maximum value!
	if (val>max) val=max;
	return Math.floor(val);
};

module.exports = RootDict;
