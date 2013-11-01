chrome.extension.isAllowedFileSchemeAccess(function(result){
	if (!result) {
		chrome.browserAction.setBadgeText({text: 'x'});
	} else {
		chrome.browserAction.setBadgeText({text: ''});
	}
});