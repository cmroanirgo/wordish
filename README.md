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

In your script add `<script type="text/javascript" src='https://unpkg.com/wordish@latest/dist/wordish.min.js'></script>` and then you're good to go!

```
<script type="text/javascript">
	function generate(){
		var wordish = new Wordish(10); // 10=high accuracy/readbility of words
		wordish.learn(sourceText);
		var words = wordish.createWords({

		});
		$('#result').value  = words.join(' ');
	}
</script>
```


## API Usage


```
const fs = require('fs')
const Wordish = require('wordish');
const filename = "somefile.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 5; // from 2 to 20..ish. 10 is very accurate, 2 is very random/ gibberish
var word = new Wordish(accuracy);
word.learn(fs.readFileSync(filename, {encoding:'utf8'}))

// generate a list of words
var options = { // these options are all optional
	minWordLen: 5,
	maxWordLen: 10,
	numWords: 10 // defaults to a random selection of 5-8
}
console.log(word.createWords(options).join('-'));
```

As a [correct battery horse staple](https://xkcd.com/936/) password generator:
(requires a good set of long words in source document)

```
const fs = require('fs')
const Wordish = require('wordish');
const filename = "somefile.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 10; 
var word = new Wordish(accuracy);
word.learn(fs.readFileSync(filename, {encoding:'utf8'}))

// generate a list of words
var options = { // these options are all optional
	minWordLen: 8,
	maxWordLen: 15,
	numWords: 4 
}
for (var i=0; i<5; i++)
	console.log(word.createWords(options).join(' '));
```

Support Klingon!:

```
const fs = require('fs')
const Wordish = require('wordish');
const filename = "klingon.txt"; 

// Load up a text document that we'll use for source words
var accuracy = 10; 
var word = new Wordish(accuracy);
word.learn(fs.readFileSync(filename, {encoding:'utf8'}), klingonValidator)

// generate a list of words
var options = { // these options are all optional
}
for (var i=0; i<5; i++)
	console.log(word.createWords(options).join(' '));

function klingonValidator(text) {
	var reInvalidChars = /[^a-z\']/gi; // uses upper/lower AND '
	return text 
		.replace(reInvalidChars, ' ') // make invalid chars a SPACE
		.replace(/  /g, ' ').trim(); // remove excess whitespace
}
```

Demo klingon output (*):

```
neH puql loD afflichen ghaH womb loD
Earthly chenmo tlhuH Hev tlhIH vo' vaj SoS
palaces 'a' Hegh 'ej Hoch 'ej
```

(*) Not actually klingon!