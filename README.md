# videojs-vjstranscribe

Creates searchable transcripts from text tracks

## Demo
[TODO DEMO LINK]

or

Clone this repo and use `npm run demo` and visit http://localhost:9001/demo/ on your browser.


## Usage
Include the plugin files:

* dist/videojs-vjstranscribe.js
* dist/videojs-vjstranscribe.css

also available trough  ```npm install videojs-vjstranscribe```


```
let player = videojs(document.querySelector('.video-js'), {
	plugins: {
			vjstranscribe: {}
	}
});
```

## Options

**NOTE:** if the any of the elements id does not exist in the document it will be created after the player. By default it creates the element `<div id='vjs-transcribe'></div>` to hold the transcribe widget (ex: widgetId)

```
let player = videojs(document.querySelector('.video-js'), {
	plugins: {
			vjstranscribe: {
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
	}
});
```

| Option  | Description | Default |
| ------------- | ------------- | ------------- |
| customClass | Custom class to add around the video.js player wrapper (string) | 'vjs-transcribe' |
| widgetId | #Id of the element that will hold the transcribe widget (string)  | 'vjs-transcribe' |
| selector | Enable or disable language selector (boolean)  | true |
| selectorId | #Id of the element that will hold the language selector (string)  | 'vjs-transcribe-selector' |
| download | Enable or disable a button to download the current track (boolean)  | true |
| copy | Enable or disable a button to copy the transcript widget content (boolean)  | true |
| downloadId | #Id of the element that will hold the download and copy buttons (string)  | 'vjs-transcribe-download' |
| search | Enable or disable a field to search within the transcript widget (boolean)  | true |
| searchId | #Id of the element that will hold the search field (string)  | 'vjs-transcribe-search' |
| pip | Enable or disable a picture-in-picture element for the player whenver the transcript is active (boolean)  | true |
| pipId | #Id of the element that will hold the picture-in-picture player (string)  | 'vjs-transcribe-download' |
| mode | It can be set to either `'line'` which shows each text track item in a single line with time stamps, or `'prose'` that strips out timestamps and presents a running text (string)  | 'line' |




## Style
Styles are minimal so it inherits from your css, although whatever is set can be easily overriden.
Two root vars are set for convenience
```
:root {
  --vjs-transcribe-primary-color: #8CC04F;
  --vjs-transcribe-secondary-color: #d9d9d7;
}
```