export default class VjsTranscribeWidget {

  widgetId;
  activeTrack;
  plugin;
  $body;

  constructor(widgetId, activeTrack, plugin ) {
    this.widgetId = widgetId;
    this.activeTrack = activeTrack;
    this.plugin = plugin;

    if (!document.getElementById(this.widgetId)) {
      let $widgetId = document.createElement('div');
      $widgetId.setAttribute('id', this.widgetId)
      this.plugin.player.el().insertAdjacentElement("afterend", $widgetId);  
    }
    
    this.createWidgetBody(this.activeTrack);

  }

  createWidgetBody(activeTrack) {
    this.activeTrack = activeTrack;
    this.$body = document.createElement('div');
    this.$body.classList.add('vjs-transcribe-body');
    
    if ( this.plugin.options.mode === 'prose') {
      this.$body.classList.add('vjs-transcribe-body-prose')
    }
    let line, i;
    let fragment = document.createDocumentFragment();
 
    for (i = 0; i < this.activeTrack.cues.length; i++) {
      line = this.createLine(this.activeTrack.cues[i]);
      fragment.appendChild(line);
    }
    this.$body.innerHTML = '';
    this.$body.appendChild(fragment);
    this.$body.setAttribute('lang', this.activeTrack.language);
    document.getElementById(this.widgetId).innerHTML = '';
    document.getElementById(this.widgetId).appendChild(this.$body);
  }

  formatDuration(secondsFloat) {
    // Convert float to integer seconds.
    let totalSeconds = Math.floor(secondsFloat);

    // Calculate hours, minutes, and seconds.
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600; // Remaining seconds after extracting hours.
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    // Format minutes and seconds to always be two digits.
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    let formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    // Construct duration string based on whether hours are present.
    return hours > 0
        ? `${hours}:${formattedMinutes}:${formattedSeconds}`
        : `${formattedMinutes}:${formattedSeconds}`;
  }

  createLine(cue) {
    let line = document.createElement('div');
    let timestamp = document.createElement('span');
    let text = document.createElement('span');
    line.setAttribute('data-begin', cue.startTime);
    line.classList.add('vjs-transcribe-cueline')
    timestamp.textContent = this.formatDuration(cue.startTime);
    timestamp.classList.add('vjs-transcribe-cuetimestamp');
    text.innerHTML = this.plugin.parseTags(cue.text);
    line.appendChild(timestamp);
    line.appendChild(text);
    line.addEventListener('click', this.clickTimestamp.bind(this));
    return line;
  }

  clickTimestamp(e) {
    let clickedTime = e.target.getAttribute('data-begin') || e.target.parentElement.getAttribute('data-begin');
    if (clickedTime !== undefined && clickedTime !== null) { // can be zero
     this.plugin.player.currentTime(parseInt(clickedTime));
    }
  }

  setCue(time) {
    
    let i, line, begin, end;
    let lines = this.$body.children;
    let cueSet = false;
    
    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      begin = line.getAttribute('data-begin');
      if (i < lines.length - 1) {
        end = lines[i + 1].getAttribute('data-begin');
      } else {
        end = this.plugin.player.duration() || Infinity;
      }
      
      if (time > begin && time < end) {
        if (!line.classList.contains('cue-active')) { // don't update if it hasn't changed

          line.classList.add('cue-active');
          cueSet = true;
          
        }
      } else {
        line.classList.remove('cue-active');
      }
    }

    let $cueActive = this.$body.querySelector('.cue-active');
    if ($cueActive && cueSet) {
      let optionsObserver = {
        root: this.$body,
        rootMargin: "0px",
        threshold: 0,
      };
      
      let observer = new IntersectionObserver((entries) => {
        if ( entries[0].intersectionRatio < 1) {
          this.$body.scrollTo({
            top: $cueActive.offsetTop - this.$body.offsetTop - this.$body.offsetHeight + $cueActive.offsetHeight,
            left: 0,
            behavior: "smooth",
          })
        }
        observer.unobserve($cueActive);
      }, optionsObserver);
  
      observer.observe($cueActive);
    }
    
  };


}
