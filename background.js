chrome.tabs.onUpdated.addListener(async function(tabId, info, tab) {
  const youtubeUrl = 'https://www.youtube.com';

  if (info.status === 'complete') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tab.url == (youtubeUrl + '/')) {
        console.debug('Display "Top Page"');
        chrome.tabs.sendMessage(tabs[0].id, {page: 'top'});
      } else if (tab.url.indexOf(youtubeUrl + '/watch') !== -1) {
        console.debug('Display "Watch Movie Page"');
        chrome.tabs.sendMessage(tabs[0].id, {page: 'watchMovie'});
      } else if (tab.url == (youtubeUrl + '/feed/subscriptions')) {
        console.debug('Display "Subscription Page"');
        chrome.tabs.sendMessage(tabs[0].id, {page: 'subscription'});
      } else if (tab.url.indexOf(youtubeUrl + '/results') !== -1) {
        console.debug('Display "Search Result Page"');
        chrome.tabs.sendMessage(tabs[0].id, {page: 'searchResult'});
      }  else if (tab.url.indexOf(youtubeUrl + '/playlist') !== -1) {
        console.debug('Display "Playlist Page"');
        chrome.tabs.sendMessage(tabs[0].id, {page: 'playlist'});
      }
    })
  }
});
