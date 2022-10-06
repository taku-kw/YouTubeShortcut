const Page = {
  none: 0,
  top: 1,
  watchMovie: 2,
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
          index = 0;
          focusMovieInitTop(index);
          break;
        case 'watchMovie':
          page = Page.watchMovie;
          index = 0;
          setTimeout(() => registerOnEndedMovie(), 500);
          break;
        case 'subscription':
          page = Page.subscription;
          index = 0;
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
  
  const movieElemId = '.yt-simple-endpoint' + '.inline-block' + '.style-scope' + '.ytd-thumbnail';
  const movieAreaElemIdMap = new Map([
    [Page.none, 'undefined'],
    [Page.top, '.style-scope' + '.ytd-rich-grid-renderer'],
    [Page.watchMovie, '.ytp-endscreen-content'],
    [Page.subscription, '.style-scope' + '.ytd-grid-renderer'],
    [Page.searchResult, '.style-scope' + '.ytd-item-section-renderer'],
    [Page.playlist, '']
  ]);

  function focusMovieInitTop(index) {
    setTimeout(function() {
      const movie = $(movieAreaElemIdMap.get(page)).find(movieElemId)[index];
      focusMovie(movie);
    }, 500);
  }

  function focusMovieInitSubscription(index) {
    setTimeout(function() {
      const movie = $(movieAreaElemIdMap.get(page)).find(movieElemId)[index];
      focusMovie(movie);
    }, 500);
  }

  function focusMovieInitSearchResult(index) {
    setTimeout(function() {
      const movie = $(movieAreaElemIdMap.get(page)).find(movieElemId)[index];
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

  function registerOnEndedMovie() {
    const player = $('.video-stream' + '.html5-main-video')[0];
    player.addEventListener('ended', function() {
      const movie = $(movieAreaElemIdMap.get(page)).find('.ytp-videowall-still' + '.ytp-suggestion-set')[0];
      focusMovie(movie);
    }, false);
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

    if ($('input').is(':focus')) {
      return;
    }

    // Avoid interfering with existing shortcuts
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
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
      case Page.watchMovie:
        operateWatchMoviePage(e.key);
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
    
    const movieList = $(movieAreaElemIdMap.get(page)).find(movieElemId);
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
      case 'v':
        unfocusMovie(movieList[index]);
        window.open(movieList[index]['href'], '_blank');
        return;
      case 'b':
        window.open(movieList[index]['href'], null, 'width=500,toolbar=yes,menubar=yes,scrollbars=yes, bookmarkbar=yes');
        return;
      default:
        return;
    }

    let nextIndexOffsetUnit = nextIndexOffset;
    while(true) {
      const nextIndex = index + nextIndexOffset;
      if (movieList[nextIndex] != null && nextIndex >= 0) {
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

  /* Watch Movie Page */
  function operateWatchMoviePage(key) {
    console.debug(`Call operateWatchMoviePage(${key})`);

    let player = $('.video-stream' + '.html5-main-video')[0];
    if (!player.ended) {
      // Player Playing
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
        case 'x':
          // PlaybackRate to 2.0 
          if (player.playbackRate != 2.0) {
            player.playbackRate = 2.0;
          } else {
            player.playbackRate = 1.0;
          }
          break;
        case 'z':
          // PlaybackRate to 0.5 
          if (player.playbackRate != 0.5) {
            player.playbackRate = 0.5;
          } else {
            player.playbackRate = 1.0;
          }
          break;
        default:
          return;
      }
    } else {
      // Player Ended
      const movieList = $('.ytp-endscreen-content').find('.ytp-videowall-still' + '.ytp-suggestion-set');
      let nextIndexOffset = 0;
      
      switch(key) {
        case 'w':
          nextIndexOffset = -1;
          break;
        case 'a':
          nextIndexOffset = -3;
          break;
        case 's':
          nextIndexOffset = 1;
          break;
        case 'd':
          nextIndexOffset = 3;
          break;
        case 'e':
          unfocusMovie(movieList[index]);
          movieList[index].click();
          break;
        case 'v':
          unfocusMovie(movieList[index]);
          window.open(movieList[index]['href'], '_blank');
          return;
        default:
          return;
      }

      const nextIndex = index + nextIndexOffset;
      if (movieList[nextIndex] != null && 0 <= nextIndex && nextIndex < 12) {
        unfocusMovie(movieList[index]);
        focusMovie(movieList[nextIndex]);
        index = nextIndex;
      }
    }
  }

  /* Subscription Page */
  function operateSubscriptionPage(key) {
    console.debug(`Call operateSubscriptionPage(${key})`);

    const movieList = $(movieAreaElemIdMap.get(page)).find(movieElemId);
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
      case 'v':
        unfocusMovie(movieList[index]);
        window.open(movieList[index]['href'], '_blank');
        return;
      case 'b':
        window.open(movieList[index]['href'], null, 'width=500,toolbar=yes,menubar=yes,scrollbars=yes, bookmarkbar=yes');
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

  /* Search Result Page */
  function operateSearchResultPage(key) {
    console.debug(`Call operateSearchResultPage(${key})`);

    const movieList = $(movieAreaElemIdMap.get(page)).find(movieElemId);
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
      case 'v':
        unfocusMovie(movieList[index]);
        window.open(movieList[index]['href'], '_blank');
        return;
      case 'b':
        window.open(movieList[index]['href'], null, 'width=500,toolbar=yes,menubar=yes,scrollbars=yes, bookmarkbar=yes');
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
