
var currentURL = window.location.href,
	protocol = window.location.protocol,
	localPath = '';

function isEmptyObject( obj ) {
	for (var name in obj ) {
		return false;
	}
	return true;
}

function getAddresses() {
	chrome.storage.sync.get({ localhostAddresses: []}, function(response){
		var addressesArr = response.localhostAddresses;

		for(var i in addressesArr) {
			if(protocol == 'file:' && currentURL.indexOf(addressesArr[i].localDirectory) > -1) {
				var newhref = currentURL.replace(addressesArr[i].localDirectory, addressesArr[i].httpAddress);
					newhref = newhref.replace('file:///', 'http://');

				window.location.href = newhref;
			}
		}

	});
}

chrome.storage.sync.get('localhost_path', function(response){
	if(isEmptyObject(response)) {
		getAddresses();
	}
	else {
		var oldPath = response.localhost_path,
			newArr = [];

		chrome.storage.sync.remove('localhost_path', function(){
			newArr.push({
				localDirectory: oldPath,
				httpAddress: 'localhost'
			});

			chrome.storage.sync.set({ localhostAddresses: newArr }, function(){
				getAddresses();
			});
		});
	}
});

