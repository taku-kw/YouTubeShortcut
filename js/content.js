const Page = {
  none: 0,
  top: 1,
  watch: 2,
  subscription: 3,
  searchResult: 4,
  playlist: 5
}

let page = Page.none;
let index = 1;

$(function() {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.debug(`Recv Msg of ${request.page} From background.js`);
      switch(request.page) {
        case 'top':
          page = Page.top;
          index = 1;
          focusMovieInitTop(index);
          break;
        case 'watch':
          page = Page.watch;
          break;
        case 'subscription':
          page = Page.subscription;
          index = 1;
          focusMovieInitSubscription(index);
          break;
        case 'searchResult':
          page = Page.searchResult;
          index = 0;
          focusMovieInitSearchResult(index);
          break;
        case 'playlist':
          page = Page.playlist;
          break;
      }
  
      sendResponse(function() {return true;});
    }
  )
  
  function focusMovieInitTop(index) {
    setTimeout(function() {
      const movie = $('.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail')[index];
      focusMovie(movie);
    }, 500);
  }

  function focusMovieInitSubscription(index) {
    setTimeout(function() {
      const movie = $('.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail')[index];
      focusMovie(movie);
    }, 500);
  }

  function focusMovieInitSearchResult(index) {
    setTimeout(function() {
      const movie = $('.style-scope' + '.ytd-item-section-renderer').find('.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail')[index];
      focusMovie(movie);
    }, 500);
  }

  function focusMovie(movie) {
    if (movie != null) {
      movie.focus();
      movie.classList.add('focus-movie');
    }
  }
  
  function unfocusMovie(movie) {
    if (movie != null) {
      movie.classList.remove('focus-movie');
    }
  }
    
  $(window).keydown(function(e) {

    if (e.ctrlKey) {
      if (e.key == 'i') {
        let searchForm = $('#search input');
        if (!(searchForm.is(':focus'))) {
          searchForm.focus();
          return false;
        } else {
          searchForm.blur();
          return false;
        }
      }
    }

    if ($('#search input').is(':focus')) {
      return;
    }

    switch(e.key) {
      case 't':
        if (location.href != 'https://www.youtube.com/') {
          location.href = 'https://www.youtube.com/';
        }
        break;
      case 'c':
        if (location.href != 'https://www.youtube.com/feed/subscriptions') {
          location.href = 'https://www.youtube.com/feed/subscriptions';
        }
        break;
      case 'q':
        if (location.href != 'https://www.youtube.com/') {
          history.back();
        }
        break;
      default:
        break;
    }

    switch(page) {
      case Page.top:
        operateTopPage(e.key);
        break;
      case Page.watch:
        operateWatchPage(e.key);
        break;
      case Page.subscription:
        operateSubscriptionPage(e.key);
        break;
      case Page.searchResult:
        operateSearchResultPage(e.key);
        break;
      case Page.playlist:
        operatePlaylistPage(e.key);
        break;
      default:
        return;
    }
  })

  /* TOP Page */
  function operateTopPage(key) {
    console.debug(`Call operateTopPage(${key})`);

    if ($('#search').is(':focus')) {
      return;
    }
    
    const movieList = $('.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail');
    let nextIndexOffset = 0;

    switch(key) {
      case 'w':
        nextIndexOffset = -4;
        break;
      case 'a':
        nextIndexOffset = -1;
        break;
      case 's':
        nextIndexOffset = 4;
        break;
      case 'd':
        nextIndexOffset = 1;
        break;
      case 'e':
        unfocusMovie(movieList[index]);
        movieList[index].click();
        return;
      default:
        return;
    }

    let nextIndexOffsetUnit = nextIndexOffset;
    while(true) {
      const nextIndex = index + nextIndexOffset;
      if (movieList[nextIndex] != null && nextIndex > 0) {
        if (isDisplay(movieList[nextIndex])) {
          unfocusMovie(movieList[index]);
          focusMovie(movieList[nextIndex]);
          index = nextIndex;
          break;
        } else {
          nextIndexOffset = nextIndexOffset + nextIndexOffsetUnit;
        }
      } else {
        break;
      }
    }
  }

  function isDisplay(elem) {
    let ret = true;
    let ancestor = elem.closest('.style-scope .ytd-rich-shelf-renderer')
    if (ancestor) {
      if (document.defaultView.getComputedStyle(ancestor, null).display == 'none') {
        ret = false;
      }
    }
    return ret;
  }

  /* Watch Page */
  function operateWatchPage(key) {
    console.debug(`Call operateWatchPage(${key})`);

    let player = $('.video-stream' + '.html5-main-video')[0];
    switch(key) {
      case 'w':
        // Volume Up
        if (player.volume + 0.05 <= 1.00) {
          player.volume += 0.05;
        } else {
          player.volume = 1.00;
        }
        break;
      case 'a':
        // Back 5 seconds
        if (player.currentTime - 5 >= 0) {
          player.currentTime -= 5;
        } else {
          player.currentTime = 0;
        }
        break;
      case 's':
        // Volume Down
        if (player.volume - 0.05 >= 0.00) {
          player.volume -= 0.05;
        } else {
          player.volume = 0.00;
        }
        break;
      case 'd':
        // Forward 5 seconds
        if (player.currentTime + 5 <= player.duration) {
          player.currentTime += 5;
        } else {
          player.currentTime = player.duration;
        }
        break;
      default:
        return;
    }
  }

  /* Subscription Page */
  function operateSubscriptionPage(key) {
    console.debug(`Call operateSubscriptionPage(${key})`);

    const movieList = $('.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail');
    let nextIndexOffset = 0;

    switch(key) {
      case 'w':
        nextIndexOffset = -6;
        break;
      case 'a':
        nextIndexOffset = -1;
        break;
      case 's':
        nextIndexOffset = 6;
        break;
      case 'd':
        nextIndexOffset = 1;
        break;
      case 'e':
        unfocusMovie(movieList[index]);
        movieList[index].click();
        return;
      default:
        return;
    }

    const nextIndex = index + nextIndexOffset;
    if (movieList[nextIndex] != null && nextIndex >= 1) {
      unfocusMovie(movieList[index]);
      focusMovie(movieList[nextIndex]);
      index = nextIndex;
    }
  }

  /* Search Result Page */
  function operateSearchResultPage(key) {
    console.debug(`Call operateSearchResultPage(${key})`);

    const movieList = $('.style-scope' + '.ytd-item-section-renderer').find('.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail');
    let nextIndexOffset = 0;

    switch(key) {
      case 'w':
        nextIndexOffset = -1;
        break;
      case 's':
        nextIndexOffset = 1;
        break;
      case 'e':
        unfocusMovie(movieList[index]);
        movieList[index].click();
        return;
      default:
        return;
    }

    const nextIndex = index + nextIndexOffset;
    if (movieList[nextIndex] != null && nextIndex >= 0) {
      unfocusMovie(movieList[index]);
      focusMovie(movieList[nextIndex]);
      index = nextIndex;
    }
  }

  /* Playlist Page */
  function operatePlaylistPage(key) {
    console.debug(`Call operatePlaylistPage(${key})`);
    // TODO
  }
})