(function main(){

function generate(){
}
window.generate = generate;

function fetchSource(sourceObj, cb) {
	if (sourceObj.text) {
		// already fetched
		cb(sourceObj);
		return; 
	}
	$.ajax({
		type: 'GET',
		url : "dicts/"+sourceObj.file,
		dataFilter: function(data, dataType) { 
			return data; 
		},
		dataType: "text"
		})
		.done(function(data) {
			sourceObj.text = data + '';
			cb(sourceObj);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert('failed')
		});
}

var sources = {
	"literary"   : { file: "happy-prince.txt" },
	"sermon"     : { file: "sermon.txt" },
	"lorem"      : { file: "lorem.txt" },
	"klingon"    : { file: "klingon.txt", validator: klingonValidator },
};

$(document).ready(function() {
	$('#generate').on('click', function() {
		$('#result').value = '';
		fetchSource(sources[$('#style').val()], function(srcObj) {
			var wordish = new Wordish(parseInt($('#accuracy').val()));
			wordish.learn(srcObj.text, srcObj.validator);
			var options = {
				minWordLen: parseInt($('#min-len').val()),
				maxWordLen: parseInt($('#max-len').val()),
				numWords: parseInt($('#num-words').val()),
				randomizeNumWords: parseInt($('#rand-words').val())
			}
			var words = wordish.createWords(options);
			$('#result').val(words.join($('#separator').val()));

		})
		return false;
	})

	$('input[type="range"]').on("input", function(){
		console.log(this.value);
		$(this).next().html(this.value);
	}).after("<span class='range'></span>");
}); 



function klingonValidator(phrase) {
	// trim out all invalid chars
	var reInvalidChars = /[^a-z\']/gi; // uses upper/lower AND '
	var phrase = phrase 
		.replace(reInvalidChars, ' ') // make invalid chars a SPACE
		.replace(/  /g, ' ').trim(); // remove excess whitespace
	return phrase;
};



})();