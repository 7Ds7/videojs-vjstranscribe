//
// Search
//
export default class VjsTranscribeSearch {

  searchId;
  activeTrack;
  plugin;

  $search;
  $searchInput;
  $resultsWrapper;
  $$cues;

  constructor(searchId, activeTrack, plugin) {
    this.searchId = searchId;
    this.activeTrack = activeTrack;
    this.plugin = plugin;

    if (!document.getElementById(this.searchId)) {
      let $searchId = document.createElement('div');
      $searchId.setAttribute('id', this.searchId);
      this.plugin.player.el().insertAdjacentElement("afterend", $searchId);
    }

    this.$search = document.getElementById(this.searchId);
    this.$search.classList.add('vjs-transcribe-search');
    this.$searchInput = document.createElement('input');
    this.$searchInput.setAttribute('role', 'searchbox');


    this.$searchInput.setAttribute('type', 'search');
    this.$searchInput.setAttribute('placeholder', 'Search');
    this.$searchInput.addEventListener('keyup', this.searchStart.bind(this));
    this.$searchInput.addEventListener('focus', this.searchStart.bind(this));
    this.$search.appendChild(this.$searchInput);

    this.$resultsWrapper = document.createElement('div');
    this.$resultsWrapper.classList.add('vjs-transcribe-search-results');
    this.$resultsWrapper.classList.add('vjs-transcribe-hide');

    this.$search.appendChild(this.$resultsWrapper);

    window.addEventListener('click', this.closeHandler, false);
  }

  closeHandler = this.closeSearch.bind(this);

  removeEv() {
    window.removeEventListener('click', this.closeHandler, false);
  }

  closeSearch(e) {
    if (!this.$search.querySelector('.vjs-transcribe-search-results').classList.contains('vjs-transcribe-hide') && e.target.closest(`#${this.searchId}`) === null) {
      this.$resultsWrapper.classList.add('vjs-transcribe-hide');
      this.$resultsWrapper.innerHTML = '';
    }
  }

  searchStart(e) {
    if (e.target.value && e.target.value.length > 0) {
      this.$$cues = this.queryCueLines(`#${this.plugin.options.widgetId} .vjs-transcribe-cueline`, e.target.value);
      this.$resultsWrapper.innerHTML = '';
      this.generateResults(e.target.value);
      this.$resultsWrapper.classList.remove('vjs-transcribe-hide');
    }
  }

  generateResults(val) {
    if (this.$$cues.length == 0) {
      let $nores = document.createElement('div');
      $nores.classList.add('vjs-transcribe-search-result');
      $nores.textContent = 'No results found';
      this.$resultsWrapper.appendChild($nores);
      return false;
    }
    this.$$cues.forEach(($c, i) => {
      let $text = document.createElement('span');
      $text = this.plugin.parseTags($c.querySelector('span:last-child').textContent);
      const $textBold = (str, substr) => str.replace(RegExp(substr, 'gi'), `<b>${substr}</b>`);
      let $textSpan = document.createElement('span');
      $textSpan.innerHTML = $textBold($text, val);

      let $result = document.createElement('button');
      $result.classList.add('vjs-transcribe-search-result');
      $result.dataset.index = i;
      $result.appendChild($textSpan);
      $result.addEventListener('click', this.selectResult.bind(this));
      this.$resultsWrapper.appendChild($result);
    });
  }

  selectResult(e) {
    let $res = e.currentTarget;
    this.$$cues[$res.dataset.index].dispatchEvent(new Event('click'));
    this.$resultsWrapper.classList.add('vjs-transcribe-hide');
  }


  queryCueLines(selector, text) {
    var elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function (element) {
      return RegExp(text, 'i').test(element.textContent);
    });
  }
}