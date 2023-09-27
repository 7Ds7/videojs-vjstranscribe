//
// Download button
//
export default class VjsTranscribeDownload {

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
      let $downloadId = document.createElement('div');
      $downloadId.setAttribute('id', this.downloadId);
      this.plugin.player.el().insertAdjacentElement("afterend", $downloadId);
    }

    $download = document.getElementById(this.downloadId);
    $download.innerHTML = '';

    if (this.plugin.options.download) {
      let $button = document.createElement('a');
      $button.setAttribute('href', this.activeTrack.src);
      let ext = this.activeTrack.src.split(/[#?]/)[0].split('.').pop().trim();
      $button.setAttribute('download', `${this.activeTrack.label}.${ext}`);
      $button.classList.add('vjs-transcribe-btn');
      $button.classList.add('vjs-transcribe-download');
      $button.setAttribute('title', 'Download');
      let $da11y = document.createElement('span');
      $da11y.classList.add('vjs-sr-only');
      $da11y.textContent = 'Download transcript';
      $download.appendChild($button);
    }

    if (this.plugin.options.copy) {
      let $buttonCopy = document.createElement('button');
      $buttonCopy.classList.add('vjs-transcribe-btn');
      $buttonCopy.classList.add('vjs-transcribe-copy');
      $buttonCopy.setAttribute('title', 'Copy');
      let $ca11y = document.createElement('span');
      $ca11y.classList.add('vjs-sr-only');
      $ca11y.textContent = 'Copy';
      $buttonCopy.appendChild($ca11y);
      $buttonCopy.addEventListener('click', (e) => {
        let text = '';
        document.querySelectorAll('.vjs-transcribe-cueline span:last-child').forEach((t) => {
          text += t.textContent;
          text += ' ';
        });

        navigator.clipboard.writeText(text).then(
          (e) => {
            console.log('copied to clipboard', e)
          },
          (e) => {
            console.log('failed to copy to clipboard', e)
          },
        );
      });
      $download.appendChild($buttonCopy);
    }
  }

}