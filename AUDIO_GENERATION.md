# Audio File Generation

This document explains how the custom audio files for Monday Painter were generated.

## Overview

The game uses custom WAV audio files for a better sound experience compared to synthesized Web Audio API sounds. The audio files are generated using a Node.js script that creates simple sine wave melodies.

## Audio Files

All audio files are located in `frontend/src/assets/sounds/`:

1. **lobby-music.wav** - Calm, peaceful C-E-G-E arpeggio (3.2 seconds, loops)
2. **drawing-music.wav** - Upbeat C-D-E-G-E-D melody (2.4 seconds, loops)
3. **countdown-beep.wav** - Short 800Hz beep (0.1 seconds)
4. **game-end.wav** - Victory fanfare C-E-G ascending (0.6 seconds)

## Generating Audio Files

### Prerequisites

- Node.js installed (already required for the project)

### Generate Files

Run the generation script:

```bash
node generate-audio.js
```

This will create all audio files in `frontend/src/assets/sounds/`.

## How It Works

The `generate-audio.js` script:

1. Generates sine waves at specific frequencies (musical notes)
2. Applies fade in/out for smooth transitions
3. Concatenates notes to create melodies
4. Exports as 16-bit PCM WAV files at 44.1kHz (CD quality)

### Musical Notes Used

**Lobby Music (C Major Arpeggio):**
- C4: 261.63 Hz
- E4: 329.63 Hz
- G4: 392.00 Hz
- E4: 329.63 Hz

**Drawing Music (Upbeat Melody):**
- C5: 523.25 Hz
- D5: 587.33 Hz
- E5: 659.25 Hz
- G5: 783.99 Hz
- E5: 659.25 Hz
- D5: 587.33 Hz

**Countdown Beep:**
- 800 Hz square-ish wave

**Game End Fanfare:**
- C5: 523.25 Hz (150ms)
- E5: 659.25 Hz (150ms)
- G5: 783.99 Hz (300ms)

## Customization

To customize the audio:

1. Edit `generate-audio.js`
2. Modify the note frequencies, durations, or volumes
3. Run `node generate-audio.js` to regenerate files
4. Refresh the frontend to hear changes

### Example: Change Lobby Music Tempo

```javascript
// In generate-audio.js, find generateLobbyMusic()
const noteDuration = 0.8; // Change to 0.6 for faster, 1.0 for slower
```

### Example: Change Volume

```javascript
// In generate-audio.js
generateSineWave(freq, noteDuration, 0.15) // Last parameter is volume (0.0-1.0)
```

## Technical Details

**File Format:** WAV (Waveform Audio File Format)
- Sample Rate: 44,100 Hz (CD quality)
- Bit Depth: 16-bit PCM
- Channels: Mono (1 channel)
- Encoding: Linear PCM

**Why WAV?**
- Maximum browser compatibility
- No compression artifacts
- Simple to generate
- Small file sizes for short clips

## Integration

The audio files are used by `AudioService` in the frontend:

```typescript
// frontend/src/app/core/services/audio.service.ts
this.lobbyMusic = new Audio('assets/sounds/lobby-music.wav');
this.lobbyMusic.loop = true;
this.lobbyMusic.volume = 0.4;
```

The Angular build system automatically copies files from `src/assets/` to the output directory, making them available at runtime.

## Troubleshooting

**Audio files not playing:**
1. Check browser console for errors
2. Verify files exist in `frontend/src/assets/sounds/`
3. Ensure Angular dev server is running
4. Try hard refresh (Ctrl+F5)

**Audio sounds distorted:**
1. Lower the volume in `generate-audio.js`
2. Regenerate files with `node generate-audio.js`

**Want different melodies:**
1. Look up musical note frequencies online
2. Update the `notes` arrays in `generate-audio.js`
3. Regenerate files

## Future Improvements

Possible enhancements:
- Add harmony (multiple notes playing simultaneously)
- Use different waveforms (triangle, sawtooth) for variety
- Add reverb or other effects
- Create longer, more complex melodies
- Use actual instrument samples (requires larger files)

---

**Generated:** December 7, 2025
**Script:** `generate-audio.js`
**Output:** `frontend/src/assets/sounds/*.wav`
