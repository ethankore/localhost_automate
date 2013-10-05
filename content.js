var localPath;
chrome.storage.local.get('localhost_path', function(result){
	localPath = result.localhost_path;

	var protocol = window.location.protocol;
	var currenthref = window.location.href;

	if (protocol == 'file:' && currenthref.indexOf(localPath) > -1 ) {
			var newhref = currenthref.replace(localPath, 'localhost');
			newhref = newhref.replace('file:///', 'http://')
			window.location.href = newhref;
	}	
});