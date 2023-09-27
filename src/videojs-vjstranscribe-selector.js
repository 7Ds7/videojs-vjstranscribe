//
// SelectBox
//
export default class VjsTranscribeSelector {

  selectorId;
  activeTrack;
  plugin;


  constructor(selectorId, activeTrack, plugin) {
    this.selectorId = selectorId;
    this.activeTrack = activeTrack;
    this.plugin = plugin;

    let $selector = document.createElement('select');
    $selector.setAttribute('id', this.selectorId);

    for (let i = 0; i < this.plugin.player.textTracks().tracks_.length; i++) {
      let $option = document.createElement('option');
      $option.value = this.plugin.player.textTracks().tracks_[i].language;
      if (this.activeTrack === this.plugin.player.textTracks().tracks_[i]) {
        $option.setAttribute('selected', 'selected');
      }
      $option.textContent = this.plugin.player.textTracks().tracks_[i].label || this.plugin.player.textTracks().tracks_[i].language;
      $selector.appendChild($option);
    }

    $selector.addEventListener('change', this.changeSelector.bind(this));

    if (!document.getElementById(this.selectorId)) {
      let $selectorId = document.createElement('div');
      $selectorId.setAttribute('id', this.selectorId)
      this.plugin.player.el().insertAdjacentElement("afterend", $selectorId);
    }
    document.getElementById(this.selectorId).appendChild($selector);
  }

  // Handler event as well as method e = event or track
  changeSelector(e) {
    for (let i = 0; i < this.plugin.player.textTracks().tracks_.length; i++) {
      let track = this.plugin.player.textTracks().tracks_[i];
      document.getElementById(this.selectorId).querySelector(`option[value=${track.language}]`).removeAttribute('selected');
      track.mode = "disabled";
      if ((e.target && track.language === e.target.value) || (e.language && track.language === e.language)) {
        document.getElementById(this.selectorId).querySelector(`option[value=${track.language}]`).setAttribute('selected', 'selected');
        track.mode = 'showing';
      }
    }
  }

}