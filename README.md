# YouTube PiP Pro 1.0.0

A lightweight Manifest V3 Chromium extension for YouTube playback controls.

## Version 1.0.0

Initial stable-version numbering for this project. This is not a guarantee that every browser or YouTube feature has been exhaustively tested.

## Features
- Native browser Picture-in-Picture toggle
- Play/pause, seek ±10 seconds, previous/next video
- Playback speed
- English is the first-run default; Indonesian and English are available, and the selected language is saved locally across popup closes and browser restarts
- Custom 16, 48, and 128 px extension icons

## Install / update
1. Extract this ZIP.
2. Open `chrome://extensions` (or the equivalent extensions page in your Chromium browser).
3. Enable Developer mode.
4. Click **Load unpacked** and select the extracted `youtube-pip-pro` folder containing `manifest.json`.
5. To update an existing unpacked install, replace the files in its folder and click **Reload** on the extension card.
6. Reload the YouTube tab after installing or updating.

## Compatibility and maintenance notes
- Intended for desktop Chromium-based browsers with Manifest V3 support.
- Native PiP appearance and always-on-top behavior are controlled by the browser/window manager, not this extension.
- YouTube may change its internal player DOM/classes. Previous/next and subtitle controls rely on YouTube's current player buttons and may need maintenance if YouTube changes them.
- This package was syntax-checked, but it has not been tested in every browser or on every YouTube video.
- No extension can be guaranteed to work unchanged for years; keep a backup of this ZIP and update/test it when the browser or YouTube changes.

## Setup and Preview on Ubuntu
![Preview](tutorial-refined-v2.mp4)
