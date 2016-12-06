function Automate(options) {

	var options = options || {};

	this.options = {
		debug: false,
		errorsElement: '',
		onInit: function(){}
	};

	for(var i in options) {
		this.options[i] = options[i];
	}

	var userAddresses = [];

	this.saveAddresses = function(obj, callback){

		var callback = callback || function(){};

		chrome.storage.local.set({ localhostAddresses: obj }, function(response){
			callback.call(this, response);
		});
	};

	this.removeAddress = function(localDirectory, callback){

		var callback = callback || function(){};

		chrome.storage.local.get({ localhostAddresses: [] }, function(response) {

			userAddresses = response.localhostAddresses;

			for(var i in userAddresses) {
				if(userAddresses[i].localDirectory == localDirectory) {
					userAddresses.splice(i, 1);

					chrome.storage.local.set({ localhostAddresses: userAddresses }, function(response) {
						callback.call(this, response);
					});
				}
			}

			return this;

		});

	};

	this.getAddresses = function(callback){

		var callback = callback || function(){};

		chrome.storage.local.get(null, function(response){
			callback.call(this, response);
		});

		return this;
	}.bind(this);

	this.removeAll = function(callback){

		var callback = callback || function(){};

		chrome.storage.local.remove('localhostAddresses');
		callback.call(this);

		return this;

	}.bind(this);

	this.message = function(message, color, fadeOut){
		var fadeOut = fadeOut || false;

		if(!!this.options.debug)
			console.log(message);
		else {
			$(this.options.errorsElement).fadeIn().html(message).css('color', color);
			setTimeout(function(){
				if(!!fadeOut) {
					$(this.options.errorsElement).fadeOut(250, function(){
						$(this.options.errorsElement).html('').css('color', '#000000');
					}.bind(this));
				}
			}.bind(this), 3000);
		}

	}.bind(this);

	this.options.onInit();

	return this;

}

var fieldWrapper =  '<div class="localhost-address-wrapper">';
	fieldWrapper += '	<input placeholder="e.g. d:/xampp/htdocs/" type="text" class="form-control form-item localhost-directory" />';
	fieldWrapper += '	<input placeholder="e.g. localhost" type="text" class="form-control form-item localhost-url" />';
	fieldWrapper += '	<button class="btn btn-danger removeWrapper">Remove</button>';
	fieldWrapper += '</div>';

$(document).ready(function() {

	var la = new Automate({
		debug: false,
		errorsElement: '#messages'
	});

	la.getAddresses(function(response){

		if($.isEmptyObject(response.localhostAddresses) && $.isEmptyObject(response.localhost_path)) {
			$('#la-addresses-wrapper').append(fieldWrapper);
			return;
		}

		if(!$.isEmptyObject(response.localhost_path)) {
			var oldPath = response.localhost_path,
				newArr = [];

			chrome.storage.local.remove('localhost_path', function(){
				newArr.push({
					localDirectory: oldPath,
					httpAddress: 'localhost'
				});

				chrome.storage.local.set({ localhostAddresses: newArr }, function(){
					$('#la-addresses-wrapper').append(fieldWrapper);
					$('.localhost-directory').last().val(oldPath);
					$('.localhost-url').last().val('localhost');
				});
			});
		}

		if(!$.isEmptyObject(response.localhostAddresses)) {
			$.each(response.localhostAddresses, function(index, val) {
				$('#la-addresses-wrapper').append(fieldWrapper);
				$('.localhost-directory').last().val(val.localDirectory);
				$('.localhost-url').last().val(val.httpAddress);
			});
		}

	});

	$('#saveAddresses').click(function(){

		var localDirectory,
			httpAddress,
			addressesArr = [],
			saveSuccessful = false;

		$('.localhost-address-wrapper').each(function(index, el) {

			localDirectory = ($(el).find('.localhost-directory').val().length ? $(el).find('.localhost-directory').val() : '');
			httpAddress = ($(el).find('.localhost-url').val().length ? $(el).find('.localhost-url').val() : '');

			if(!!localDirectory.length && !!httpAddress.length) {
				var localhostEntry,
				finalDirectory,
				remainder,
				drive;

				localhostEntry = localDirectory;
				localhostEntry = localhostEntry.replace(/\\/g, '/');
				remainder = localhostEntry.substring(2);
				drive = localhostEntry.substring(1,0).toUpperCase() + ':';
				finalDirectory = drive + remainder;
				if (finalDirectory.substring(finalDirectory.length - 1) == '/') {
					finalDirectory = finalDirectory.replace(/[/]$/, '');
				}

				addressesArr.push({
					localDirectory: finalDirectory,
					httpAddress: httpAddress
				});

				saveSuccessful = true;

			}

		});

		if(!!saveSuccessful) {
			la.saveAddresses(addressesArr, function(){
				la.message('Addresses saved successfully.', 'green', true);
			});
		}

	});

	$('#addAnother').click(function(){
		$('#la-addresses-wrapper').append(fieldWrapper);
	});

	$('#extensions-link').live('click', function(){
		chrome.tabs.create({
			'url': 'chrome://extensions'
		});		
	});

	$('.removeWrapper').live('click', function(){
		if($('.localhost-address-wrapper').length <= 1) {
			$('.form-item').val('');
			la.removeAll();
		}
		else {
			la.removeAddress($(this).parent().find('.localhost-directory').val());
			$(this).parent().remove();
		}

		la.message('Entry removed successfully.', 'green', true);
	});

	chrome.extension.isAllowedFileSchemeAccess(function(response){
		if (!response) {
			la.message('Please check the "Allow access to file URLs" checkbox in the <a id="extensions-link">Extensions</a> page.', 'red');
			$('div, button, input').off().val();
		}
	});

});