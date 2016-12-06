
function isEmptyObject( obj ) {
	for (var name in obj ) {
		return false;
	}
	return true;
}

chrome.storage.local.get({ version: '' }, function(response){
	if(!response.version.length || response.version != '0.7' ) {
		chrome.storage.local.set({ version: '0.7' }, function(){
			window.open(chrome.extension.getURL('updated.html'), '_blank');
		});
	}
});

chrome.extension.isAllowedFileSchemeAccess(function(result){
	if (!result) {
		chrome.browserAction.setBadgeText({text: 'x'});
	} else {
		chrome.browserAction.setBadgeText({text: ''});
	}
});