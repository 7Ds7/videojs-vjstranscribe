// import videojs from '../node_modules/video.js';
import VjsTranscribeSelector from './videojs-vjstranscribe-selector';
import VjsTranscribeDownload from './videojs-vjstranscribe-download';
import VjsTranscribeWidget from './videojs-vjstranscribe-widget';
import VjsTranscribeSearch from './videojs-vjstranscribe-search';

// window.videojs = window.videojs || videojs;
if (typeof (videojs) === "undefined") {
  console.warn('vjstranscribe videojs not detected');
}
const Plugin = videojs.getPlugin('plugin');

import './videojs-vjstranscribe.css';

//
// Plugin
//
class VjsTranscribe extends Plugin {

  defaultOptions = {
    customClass: 'vjs-transcribe',
    widgetId: 'vjs-transcribe',
    selector: true,
    selectorId: 'vjs-transcribe-selector',
    download: true,
    copy: true,
    downloadId: 'vjs-transcribe-download',
    search: true,
    searchId: 'vjs-transcribe-search',
    pip: true,
    pipId: 'vjs-transcribe-pip',
    mode: 'line',
    disablecc: true
  }

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

    this.on(player, 'ready', function () {
      if (this.getActiveTrack()) {
        const Button = videojs.getComponent('Button');
        let button = new Button(player, {
          className: 'vjs-transcribe-btn',
          controlText: 'Transcript',
          clickHandler: (event) => {
            if (!this.activated) {
              this.createTranscript(player);
            } else {
              this.destroyTranscript();
            }
          }
        });
        player.getChild('ControlBar').el().insertBefore(button.el(), player.getChild('ControlBar').getChild('subsCapsButton').el());
      }
    });


    this.on(player.textTracks(), 'change', function (e) {
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

    this.on(player, 'timeupdate', function () {
      if (this.activated && this.widgetComponent) {
        this.widgetComponent.setCue(player.currentTime());
      }
    })

  }

  getTextTracks() {
    let tracks = this.player.textTracks().tracks_;

    return tracks.filter((track) => {
      return track.kind !== 'metadata';
    })
  }

  getActiveTrack() {
    let i, track;
    for (i = 0; i < this.getTextTracks().length; i++) {
      track = this.getTextTracks()[i];
      if (track.mode === 'showing') {
        this.activeTrack = track;
      }
    }

    // fallback to first track even if it is off
    return this.activeTrack || this.getTextTracks()[0];
  }

  createTranscript() {
    let active = this.getActiveTrack();
    const that = this;
    this.activated = true;
    this.totalTracks = this.getTextTracks().length;

    if (!active.activeCues) {
      window.setTimeout(function () {
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

      this.player.el().classList.add('vjs-transcribe-active');
      if (this.options.pip) {
        this.$initialParent = this.player.el().parentElement;
        let $pip = this.getPip();
        $pip.appendChild(this.player.el());
        $pip.classList.add('vjs-transcribe-pip');
        $pip.classList.add('pip-active');
      }

      if (this.options.disablecc) {
        this.player.el().querySelector('.vjs-text-track-display').style.display = 'none';
      }

      window.dispatchEvent(new Event('vjstranscribe.on'));
    }
  }

  getPip() {
    if (!document.getElementById(this.options.pipId)) {
      let $pipId = document.createElement('div');
      $pipId.setAttribute('id', this.options.pipId);
      this.player.el().insertAdjacentElement("afterend", $pipId);
    }
    return document.getElementById(this.options.pipId)
  }

  parseTags(html){
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    let doc = new DOMParser().parseFromString(txt.value, 'text/html');
    return doc.body.textContent ||  doc.body.innerText || "";
  }

  destroyTranscript() {
    this.activated = false;
    this.widgetComponent = undefined;
    this.activeTrack = undefined;
    this.player.el().classList.remove('vjs-transcribe-active');
    document.getElementById(this.options.widgetId).innerHTML = '';
    if (this.options.download || this.options.copy) {
      this.downloadComponent = undefined;
      document.getElementById(this.options.downloadId).innerHTML = '';
    }
    if (this.options.selector && this.totalTracks > 0) {
      this.selectorComponent = undefined;
      document.getElementById(this.options.selectorId).innerHTML = '';
    }
    if (this.options.search) {
      this.searchComponent.removeEv();
      this.searchComponent = undefined;
      document.getElementById(this.options.searchId).innerHTML = '';
    }
    if (this.options.pip) {
      this.$initialParent.insertBefore(this.player.el(), this.$initialParent.firstChild);
    }
    if (this.options.disablecc) {
      this.player.el().querySelector('.vjs-text-track-display').style.display = 'block';
    }
    if (this.options.pip) {
      let $pip = this.getPip();
      $pip.classList.remove('pip-active');
    }

    window.dispatchEvent(new Event('vjstranscribe.off'));
  }
}


videojs.registerPlugin('vjstranscribe', VjsTranscribe);
