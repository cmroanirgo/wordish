# Wordish

A generator of word like phrases. Useful for passwords and publishing. Try it out: [cmroanirgo.github.io/wordish/](https://cmroanirgo.github.io/wordish/).

## Installation (for commandline use)

```
npm install -g wordish
wordish
```

## Installation (for api use)

```
npm install -s wordish
```


## Installation (for use in browser)

In your script the following and you're good to go!

```
<script type="text/javascript" src='https://unpkg.com/wordish@latest/dist/wordish.min.js'></script>
<script type="text/javascript">
	function generate(){
		var dict = new Wordish(10); // 10=high accuracy/readbility of words
		dict.learn(sourceText, { });
		var words = dict.createWords({
		});
		$('#result').value  = words.join(' ');
	}
</script>
```

## Wordish API

The main class that you interact with is _Wordish_ and is always instantiated by using the following:

```
var accuracy = 5; // from 2 to 20..ish. 10 is very accurate, 2 is very random/ gibberish
var dict = new Wordish(accuracy);
or
var dict = new Wordish(); // the default accuracy is 5
```

### Note about accuracy

The accuracy controls how many consecutive letters are remembered. For instance, if the accuracy is 5, when a word longer than that appears (eg 'welcome', then the tree would stop remembering after 'weclo' and the 'me' gets munged into the rest of the tree)

### learn
This is the first function to be called in order to populate the dictionary. It may be called multiple times to load different source texts. It has the form:

```
dict.learn(sourceText[,options]);
```

where `options` may contain:
* minWordLen. Any words shorter than this will be removed
* maxWordLen. Any words longer than this will be removed
* validator. This is a callback function which simply sanitises the input `sourceText`. Any characters (whether english letters or not), will be added to the dictionary.

The default validator is good for English words and looks like:
```
function defaultValidator(text) {
	return text.toLowerCase() // ignore case
		.replace(/[^a-z]/gi, ' ') // make invalid chars a SPACE
		.replace(/\b(?:and|an|or|the)\b/gi, ' ')// trim *very* common words
		.replace(/ {2,}/g, ' ').trim(); // remove excess whitespace
};
```

A _Klingon_ validator would be different, because it has uppercase characters and apostrophes inside a word:
```
function klingonValidator(text) {
	var reInvalidChars = /[^a-z\']/gi; // uses upper/lower AND '
	return text 
		.replace(reInvalidChars, ' ') // make invalid chars a SPACE
		.replace(/ {2,}/g, ' ').trim(); // remove excess whitespace
}
```

The default set of options for `learn` are:

```
var _defaultLearnOptions = {
	minWordLen: 0,
	maxWordLen: 25,
	validator: defaultValidator
};
```

### createWords
Once learning is complete, you may begin generating words. Usage:

```
var words = dict.createWords([options]);
```

The returned data is an array of words that match the constraints set by options.

The default set of options for `createWords` are:

```
var _defaultCreateOptions = {
	numWords: 4,
	randomizeNumWords: 1,
	minWordLen: 5,
	maxWordLen: 10
};

```

To generate a password, separated by a _-_:

```
var words = dict.createWords();
var password = words.join('-')
```

To generate a phrase (with a leading capital letter and ending with a period):

```
var options = { numWords:5, randomizeNumWords:12 }; // between 5 and 17 words will be generated.
var words = dict.createWords(options);
var phrase = words.join(' ').replace(/^(.)/, function(m, m1)  { return m1.toUpperCase(); }) + '.';
```

### reset
Resets any 'learnt' state back to original, but has little real world use. This is effectively the same as recreating a new Wordish object. ie:

```
dict.reset();
...
dict.learn(...);
var words = dict.createWords(...)
```


## API Examples


#### Simple

```
const fs = require('fs')
const Wordish = require('Wordish');
const filename = "somefile.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 5; // from 2 to 20..ish. 10 is very accurate, 2 is very random/ gibberish. Words longer than 5 will get 'munged' into the dictionary.
var dict = new Wordish(accuracy);
dict.learn(fs.readFileSync(filename, {encoding:'utf8'}))

// generate a list of words
var options = { // these options are all optional
	minWordLen: 5,
	maxWordLen: 10,
	numWords: 10,
	randomizeNumWords: 2 // between 10 and 12 words will be made
}
console.log(dict.createWords(options).join('-'));
```

#### A [correct battery horse staple](https://xkcd.com/936/) password generator.

Note how the learn option, `minWordLen` here matches the `createWord` option & means that shorter words cannot be used to 'make up' a word. You need to use a long section of source text for this to work securely, however. (eg War and Peace, The Bible, or a list of the most common words):


```
const fs = require('fs')
const Wordish = require('wordish');
const filename = "somefile.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 10; 
var dict = new Wordish(accuracy);
dict.learn(fs.readFileSync(filename, {encoding:'utf8'}), {minWordLen: 5}) 

// generate a list of words
var options = { // these options are all optional
	minWordLen: 5,
	maxWordLen: 10,
	numWords: 4,
	randomizeNumWords: 2 // betwen 4 and 6 words made
}
for (var i=0; i<5; i++)
	console.log(dict.createWords(options).join(' '));
```

#### Support Klingon!:

```
const fs = require('fs')
const Wordish = require('wordish');
const filename = "klingon.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 10; 
var dict = new Wordish(accuracy);
dict.learn(fs.readFileSync(filename, {encoding:'utf8'}), klingonValidator) // the learn function can also take just a validatorFunction as an options argument


var options = {}; // use defaults
for (var i=0; i<5; i++) // create a series of phrases
	console.log(dict.createWords(options).join(' '));

function klingonValidator(text) {
	var reInvalidChars = /[^a-z\']/gi; // uses upper/lower AND '
	return text 
		.replace(reInvalidChars, ' ') // make invalid chars a SPACE
		.replace(/ {2,}/g, ' ').trim(); // remove excess whitespace
}
```

Demo klingon output (*):

```
neH puql loD afflichen ghaH womb loD
Earthly chenmo tlhuH Hev tlhIH vo' vaj SoS
palaces 'a' Hegh 'ej Hoch 'ej
```

(*) Not actually klingon!