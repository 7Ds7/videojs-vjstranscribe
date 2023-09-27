/*!
* videojs-vjstranscribe
* @author 7Ds7
* @version 1.0.1
* @url https://github.com/7Ds7/videojs-vjstranscribe.git
* Copyright 2023 GPLv3 licensed.
*/
(() => {
  // src/videojs-vjstranscribe-selector.js
  var VjsTranscribeSelector = class {
    selectorId;
    activeTrack;
    plugin;
    constructor(selectorId, activeTrack, plugin) {
      this.selectorId = selectorId;
      this.activeTrack = activeTrack;
      this.plugin = plugin;
      let $selector = document.createElement("select");
      $selector.setAttribute("id", this.selectorId);
      for (let i = 0; i < this.plugin.player.textTracks().tracks_.length; i++) {
        let $option = document.createElement("option");
        $option.value = this.plugin.player.textTracks().tracks_[i].language;
        if (this.activeTrack === this.plugin.player.textTracks().tracks_[i]) {
          $option.setAttribute("selected", "selected");
        }
        $option.textContent = this.plugin.player.textTracks().tracks_[i].label || this.plugin.player.textTracks().tracks_[i].language;
        $selector.appendChild($option);
      }
      $selector.addEventListener("change", this.changeSelector.bind(this));
      if (!document.getElementById(this.selectorId)) {
        let $selectorId = document.createElement("div");
        $selectorId.setAttribute("id", this.selectorId);
        this.plugin.player.el().insertAdjacentElement("afterend", $selectorId);
      }
      document.getElementById(this.selectorId).appendChild($selector);
    }
    // Handler event as well as method e = event or track
    changeSelector(e) {
      for (let i = 0; i < this.plugin.player.textTracks().tracks_.length; i++) {
        let track = this.plugin.player.textTracks().tracks_[i];
        document.getElementById(this.selectorId).querySelector(`option[value=${track.language}]`).removeAttribute("selected");
        track.mode = "disabled";
        if (e.target && track.language === e.target.value || e.language && track.language === e.language) {
          document.getElementById(this.selectorId).querySelector(`option[value=${track.language}]`).setAttribute("selected", "selected");
          track.mode = "showing";
        }
      }
    }
  };

  // src/videojs-vjstranscribe-download.js
  var VjsTranscribeDownload = class {
    downloadId;
    activeTrack;
    plugin;
    constructor(downloadId, activeTrack, plugin) {
      this.downloadId = downloadId;
      this.activeTrack = activeTrack;
      this.plugin = plugin;
      this.changeDownload(this.activeTrack);
    }
    changeDownload(track) {
      this.activeTrack = track;
      let $download;
      if (!document.getElementById(this.downloadId)) {
        let $downloadId = document.createElement("div");
        $downloadId.setAttribute("id", this.downloadId);
        this.plugin.player.el().insertAdjacentElement("afterend", $downloadId);
      }
      $download = document.getElementById(this.downloadId);
      $download.innerHTML = "";
      if (this.plugin.options.download) {
        let $button = document.createElement("a");
        $button.setAttribute("href", this.activeTrack.src);
        let ext = this.activeTrack.src.split(/[#?]/)[0].split(".").pop().trim();
        $button.setAttribute("download", `${this.activeTrack.label}.${ext}`);
        $button.classList.add("vjs-transcribe-btn");
        $button.classList.add("vjs-transcribe-download");
        $button.setAttribute("title", "Download");
        let $da11y = document.createElement("span");
        $da11y.classList.add("vjs-sr-only");
        $da11y.textContent = "Download transcript";
        $download.appendChild($button);
      }
      if (this.plugin.options.copy) {
        let $buttonCopy = document.createElement("button");
        $buttonCopy.classList.add("vjs-transcribe-btn");
        $buttonCopy.classList.add("vjs-transcribe-copy");
        $buttonCopy.setAttribute("title", "Copy");
        let $ca11y = document.createElement("span");
        $ca11y.classList.add("vjs-sr-only");
        $ca11y.textContent = "Copy";
        $buttonCopy.appendChild($ca11y);
        $buttonCopy.addEventListener("click", (e) => {
          let text = "";
          document.querySelectorAll(".vjs-transcribe-cueline span:last-child").forEach((t) => {
            text += t.textContent;
            text += " ";
          });
          navigator.clipboard.writeText(text).then(
            (e2) => {
              console.log("copied to clipboard", e2);
            },
            (e2) => {
              console.log("failed to copy to clipboard", e2);
            }
          );
        });
        $download.appendChild($buttonCopy);
      }
    }
  };

  // src/videojs-vjstranscribe-widget.js
  var VjsTranscribeWidget = class {
    widgetId;
    activeTrack;
    plugin;
    $body;
    constructor(widgetId, activeTrack, plugin) {
      this.widgetId = widgetId;
      this.activeTrack = activeTrack;
      this.plugin = plugin;
      if (!document.getElementById(this.widgetId)) {
        let $widgetId = document.createElement("div");
        $widgetId.setAttribute("id", this.widgetId);
        this.plugin.player.el().insertAdjacentElement("afterend", $widgetId);
      }
      this.createWidgetBody(this.activeTrack);
    }
    createWidgetBody(activeTrack) {
      this.activeTrack = activeTrack;
      this.$body = document.createElement("div");
      this.$body.classList.add("vjs-transcribe-body");
      if (this.plugin.options.mode === "prose") {
        this.$body.classList.add("vjs-transcribe-body-prose");
      }
      let line, i;
      let fragment = document.createDocumentFragment();
      for (i = 0; i < this.activeTrack.cues.length; i++) {
        line = this.createLine(this.activeTrack.cues[i]);
        fragment.appendChild(line);
      }
      this.$body.innerHTML = "";
      this.$body.appendChild(fragment);
      this.$body.setAttribute("lang", this.activeTrack.language);
      document.getElementById(this.widgetId).innerHTML = "";
      document.getElementById(this.widgetId).appendChild(this.$body);
    }
    createLine(cue) {
      let line = document.createElement("div");
      let timestamp = document.createElement("span");
      let text = document.createElement("span");
      line.setAttribute("data-begin", cue.startTime);
      line.classList.add("vjs-transcribe-cueline");
      timestamp.textContent = new Date(1e3 * cue.startTime).toISOString().substr(11, 8).replace(/^[0:]+/, "");
      timestamp.classList.add("vjs-transcribe-cuetimestamp");
      text.innerHTML = this.plugin.parseTags(cue.text);
      line.appendChild(timestamp);
      line.appendChild(text);
      line.addEventListener("click", this.clickTimestamp.bind(this));
      return line;
    }
    clickTimestamp(e) {
      let clickedTime = e.target.getAttribute("data-begin") || e.target.parentElement.getAttribute("data-begin");
      if (clickedTime !== void 0 && clickedTime !== null) {
        this.plugin.player.currentTime(parseInt(clickedTime));
      }
    }
    setCue(time) {
      let i, line, begin, end;
      let lines = this.$body.children;
      let cueSet = false;
      for (i = 0; i < lines.length; i++) {
        line = lines[i];
        begin = line.getAttribute("data-begin");
        if (i < lines.length - 1) {
          end = lines[i + 1].getAttribute("data-begin");
        } else {
          end = this.plugin.player.duration() || Infinity;
        }
        if (time > begin && time < end) {
          if (!line.classList.contains("cue-active")) {
            line.classList.add("cue-active");
            cueSet = true;
          }
        } else {
          line.classList.remove("cue-active");
        }
      }
      let $cueActive = this.$body.querySelector(".cue-active");
      if ($cueActive && cueSet) {
        let optionsObserver = {
          root: this.$body,
          rootMargin: "0px",
          threshold: 0
        };
        let observer = new IntersectionObserver((entries) => {
          if (entries[0].intersectionRatio < 1) {
            this.$body.scrollTo({
              top: $cueActive.offsetTop - this.$body.offsetTop - this.$body.offsetHeight + $cueActive.offsetHeight,
              left: 0,
              behavior: "smooth"
            });
          }
          observer.unobserve($cueActive);
        }, optionsObserver);
        observer.observe($cueActive);
      }
    }
  };

  // src/videojs-vjstranscribe-search.js
  var VjsTranscribeSearch = class {
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
        let $searchId = document.createElement("div");
        $searchId.setAttribute("id", this.searchId);
        this.plugin.player.el().insertAdjacentElement("afterend", $searchId);
      }
      this.$search = document.getElementById(this.searchId);
      this.$search.classList.add("vjs-transcribe-search");
      this.$searchInput = document.createElement("input");
      this.$searchInput.setAttribute("role", "searchbox");
      this.$searchInput.setAttribute("type", "search");
      this.$searchInput.setAttribute("placeholder", "Search");
      this.$searchInput.addEventListener("keyup", this.searchStart.bind(this));
      this.$searchInput.addEventListener("focus", this.searchStart.bind(this));
      this.$search.appendChild(this.$searchInput);
      this.$resultsWrapper = document.createElement("div");
      this.$resultsWrapper.classList.add("vjs-transcribe-search-results");
      this.$resultsWrapper.classList.add("vjs-transcribe-hide");
      this.$search.appendChild(this.$resultsWrapper);
      window.addEventListener("click", this.closeHandler, false);
    }
    closeHandler = this.closeSearch.bind(this);
    removeEv() {
      window.removeEventListener("click", this.closeHandler, false);
    }
    closeSearch(e) {
      if (!this.$search.querySelector(".vjs-transcribe-search-results").classList.contains("vjs-transcribe-hide") && e.target.closest(`#${this.searchId}`) === null) {
        this.$resultsWrapper.classList.add("vjs-transcribe-hide");
        this.$resultsWrapper.innerHTML = "";
      }
    }
    searchStart(e) {
      if (e.target.value && e.target.value.length > 0) {
        this.$$cues = this.queryCueLines(`#${this.plugin.options.widgetId} .vjs-transcribe-cueline`, e.target.value);
        this.$resultsWrapper.innerHTML = "";
        this.generateResults(e.target.value);
        this.$resultsWrapper.classList.remove("vjs-transcribe-hide");
      }
    }
    generateResults(val) {
      if (this.$$cues.length == 0) {
        let $nores = document.createElement("div");
        $nores.classList.add("vjs-transcribe-search-result");
        $nores.textContent = "No results found";
        this.$resultsWrapper.appendChild($nores);
        return false;
      }
      this.$$cues.forEach(($c, i) => {
        let $text = document.createElement("span");
        $text = this.plugin.parseTags($c.querySelector("span:last-child").textContent);
        const $textBold = (str, substr) => str.replace(RegExp(substr, "gi"), `<b>${substr}</b>`);
        let $textSpan = document.createElement("span");
        $textSpan.innerHTML = $textBold($text, val);
        let $result = document.createElement("button");
        $result.classList.add("vjs-transcribe-search-result");
        $result.dataset.index = i;
        $result.appendChild($textSpan);
        $result.addEventListener("click", this.selectResult.bind(this));
        this.$resultsWrapper.appendChild($result);
      });
    }
    selectResult(e) {
      let $res = e.currentTarget;
      this.$$cues[$res.dataset.index].dispatchEvent(new Event("click"));
      this.$resultsWrapper.classList.add("vjs-transcribe-hide");
    }
    queryCueLines(selector, text) {
      var elements = document.querySelectorAll(selector);
      return Array.prototype.filter.call(elements, function(element) {
        return RegExp(text, "i").test(element.textContent);
      });
    }
  };

  // src/videojs-vjstranscribe.js
  if (typeof videojs === "undefined") {
    console.warn("vjstranscribe videojs not detected");
  }
  var Plugin = videojs.getPlugin("plugin");
  var VjsTranscribe = class extends Plugin {
    defaultOptions = {
      customClass: "vjs-transcribe",
      widgetId: "vjs-transcribe",
      selector: true,
      selectorId: "vjs-transcribe-selector",
      download: true,
      copy: true,
      downloadId: "vjs-transcribe-download",
      search: true,
      searchId: "vjs-transcribe-search",
      pip: true,
      pipId: "vjs-transcribe-pip",
      mode: "line",
      disablecc: true
    };
    activeTrack;
    selectorComponent;
    widgetComponent;
    downloadComponent;
    searchComponent;
    $initialParent;
    activated = false;
    totalTracks = 0;
    constructor(player, options) {
      super(player, options);
      this.options = { ...this.defaultOptions, ...options };
      player.addClass(this.options.customClass);
      this.on(player, "ready", function() {
        if (this.getActiveTrack()) {
          const Button = videojs.getComponent("Button");
          let button = new Button(player, {
            className: "vjs-transcribe-btn",
            controlText: "Transcript",
            clickHandler: (event) => {
              if (!this.activated) {
                this.createTranscript(player);
              } else {
                this.destroyTranscript();
              }
            }
          });
          player.getChild("ControlBar").el().insertBefore(button.el(), player.getChild("ControlBar").getChild("subsCapsButton").el());
        }
      });
      this.on(player.textTracks(), "change", function(e) {
        const active = this.getActiveTrack();
        if (active.activeCues && this.widgetComponent && active !== this.widgetComponent.activeTrack) {
          this.widgetComponent.createWidgetBody(active);
          if (this.options.selector && this.totalTracks > 0) {
            this.selectorComponent.changeSelector(active);
          }
          if (this.downloadComponent) {
            this.downloadComponent.changeDownload(active);
          }
        }
      });
      this.on(player, "timeupdate", function() {
        if (this.activated && this.widgetComponent) {
          this.widgetComponent.setCue(player.currentTime());
        }
      });
    }
    getActiveTrack() {
      let i, track;
      for (i = 0; i < this.player.textTracks().tracks_.length; i++) {
        track = this.player.textTracks().tracks_[i];
        if (track.mode === "showing") {
          this.activeTrack = track;
        }
      }
      return this.activeTrack || this.player.textTracks().tracks_[0];
    }
    createTranscript() {
      let active = this.getActiveTrack();
      const that = this;
      this.activated = true;
      this.totalTracks = this.player.textTracks().length;
      if (!active.activeCues) {
        window.setTimeout(function() {
          that.createTranscript();
        }, 100);
      } else {
        if (this.options.selector && this.totalTracks > 1) {
          this.selectorComponent = new VjsTranscribeSelector(this.options.selectorId, active, this);
        }
        if (this.options.search) {
          this.searchComponent = new VjsTranscribeSearch(this.options.searchId, active, this);
        }
        if (this.options.download || this.options.copy) {
          this.downloadComponent = new VjsTranscribeDownload(this.options.downloadId, active, this);
        }
        this.widgetComponent = new VjsTranscribeWidget(this.options.widgetId, active, this);
        this.player.el().classList.add("vjs-transcribe-active");
        if (this.options.pip) {
          this.$initialParent = this.player.el().parentElement;
          let $pip = this.getPip();
          $pip.appendChild(this.player.el());
          $pip.classList.add("vjs-transcribe-pip");
          $pip.classList.add("pip-active");
        }
        if (this.options.disablecc) {
          this.player.el().querySelector(".vjs-text-track-display").style.display = "none";
        }
        window.dispatchEvent(new Event("vjstranscribe.on"));
      }
    }
    getPip() {
      if (!document.getElementById(this.options.pipId)) {
        let $pipId = document.createElement("div");
        $pipId.setAttribute("id", this.options.pipId);
        this.player.el().insertAdjacentElement("afterend", $pipId);
      }
      return document.getElementById(this.options.pipId);
    }
    parseTags(html) {
      let txt = document.createElement("textarea");
      txt.innerHTML = html;
      let doc = new DOMParser().parseFromString(txt.value, "text/html");
      return doc.body.textContent || doc.body.innerText || "";
    }
    destroyTranscript() {
      this.activated = false;
      this.widgetComponent = void 0;
      this.activeTrack = void 0;
      this.player.el().classList.remove("vjs-transcribe-active");
      document.getElementById(this.options.widgetId).innerHTML = "";
      if (this.options.download || this.options.copy) {
        this.downloadComponent = void 0;
        document.getElementById(this.options.downloadId).innerHTML = "";
      }
      if (this.options.selector && this.totalTracks > 0) {
        this.selectorComponent = void 0;
        document.getElementById(this.options.selectorId).innerHTML = "";
      }
      if (this.options.search) {
        this.searchComponent.removeEv();
        this.searchComponent = void 0;
        document.getElementById(this.options.searchId).innerHTML = "";
      }
      if (this.options.pip) {
        this.$initialParent.insertBefore(this.player.el(), this.$initialParent.firstChild);
      }
      if (this.options.disablecc) {
        this.player.el().querySelector(".vjs-text-track-display").style.display = "block";
      }
      if (this.options.pip) {
        let $pip = this.getPip();
        $pip.classList.remove("pip-active");
      }
      window.dispatchEvent(new Event("vjstranscribe.off"));
    }
  };
  videojs.registerPlugin("vjstranscribe", VjsTranscribe);
})();
