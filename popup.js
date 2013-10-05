document.addEventListener('DOMContentLoaded', function () {

	// Initialization
	var localPath = document.getElementById('localhostPath');
	var submit = document.getElementById('submitBtn');
	var messages = document.getElementById('messages');
	var retrievedLocal;
	var localPathDisabled;

	// Get current path from local storage
	chrome.storage.local.get('localhost_path', function(result){
		if (result.localhost_path) {
			localPath.value = result.localhost_path;
			retrievedLocal = result.localhost_path;
		} else {
			localPath.value = '';
		}
	});

	// Configure messages area
	function message(message, color) {
		messages.innerHTML = message;
		messages.style.color = color;
	}

	// Defines link to Extensions page
	function exLink() {
		var exLink = document.getElementById('extensions-link');
		exLink.addEventListener('click', function(){
			chrome.tabs.update({ url: 'chrome://chrome/extensions/?id=ghblhcbjlbbooajbgimdpijdcpjfjege' });
		});		
	}

	// Check if user allowed access to file URLs via the Extensions page
	chrome.extension.isAllowedFileSchemeAccess(function(result){
		if (result == false) {
			message('Please check the "Allow access to file URLs" checkbox in the <a id="extensions-link" href="javascript:void(0);">Extensions</a> page.', 'red');
			localPath.disabled = true;
			localPathDisabled = true;
		}

		exLink();
	});	

	// UI
	localPath.addEventListener('click', function(){
		localPath.style.color = '#000000';
	});

	localPath.addEventListener('mousedown', function(){
		localPath.style.color = '#000000';
	});

	localPath.addEventListener('blur', function(){
		if (localPath.value == retrievedLocal) {
			localPath.style.color = '#949494';
		} else {
			localPath.style.color = '#000000';
		}
	});	

	// Set local storage
	submit.addEventListener('click', function(){
		if(localPath.value == "") {
			message('Please provide a localhost path', 'red');			
			return false;
		} else if (localPathDisabled == true) {
			message('Please check the "Allow access to file URLs" checkbox in the <a id="extensions-link" href="javascript:void(0);">Extensions</a> page.', 'red');
			exLink();
			return false;
		} else {
			var localhostEntry = localPath.value;
			localhostEntry = localhostEntry.replace(/\\/g, '/');
			var remainder = localhostEntry.substring(2);
			var drive = localhostEntry.substring(1,0).toUpperCase() + ':';
			var complete = drive + remainder;
			if (!localPathDisabled) { 
				chrome.storage.local.set({'localhost_path': complete}, function(){
					message('Settings saved!', 'blue');
				});
			}			
		}
	});
});