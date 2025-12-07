#!/usr/bin/env node
/**
 * Generate audio files for Monday Painter game
 * Uses Web Audio API offline rendering (Node.js compatible)
 */

const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'frontend', 'src', 'assets', 'sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const SAMPLE_RATE = 44100;

/**
 * Generate a sine wave
 */
function generateSineWave(frequency, durationSeconds, volume = 0.3) {
  const numSamples = Math.floor(SAMPLE_RATE * durationSeconds);
  const buffer = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    buffer[i] = Math.sin(2 * Math.PI * frequency * t) * volume;
  }
  
  // Apply fade in/out
  const fadeSamples = Math.floor(SAMPLE_RATE * 0.05); // 50ms fade
  
  for (let i = 0; i < fadeSamples; i++) {
    const fadeIn = i / fadeSamples;
    buffer[i] *= fadeIn;
    
    const fadeOut = i / fadeSamples;
    buffer[numSamples - 1 - i] *= fadeOut;
  }
  
  return buffer;
}

/**
 * Concatenate audio buffers
 */
function concatenateBuffers(buffers) {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  const result = new Float32Array(totalLength);
  
  let offset = 0;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }
  
  return result;
}

/**
 * Convert Float32Array to 16-bit PCM WAV file
 */
function saveWav(filename, audioData) {
  // Convert to 16-bit PCM
  const pcmData = new Int16Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    const s = Math.max(-1, Math.min(1, audioData[i]));
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // Create WAV file
  const buffer = Buffer.alloc(44 + pcmData.length * 2);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + pcmData.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32); // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(pcmData.length * 2, 40);
  
  // Write PCM data
  for (let i = 0; i < pcmData.length; i++) {
    buffer.writeInt16LE(pcmData[i], 44 + i * 2);
  }
  
  fs.writeFileSync(filename, buffer);
}

/**
 * Generate calm lobby music - C-E-G-E arpeggio
 */
function generateLobbyMusic() {
  console.log('Generating lobby music...');
  
  // Notes: C4, E4, G4, E4 (major chord arpeggio)
  const notes = [261.63, 329.63, 392.00, 329.63];
  const noteDuration = 0.8; // seconds
  
  const buffers = notes.map(freq => 
    generateSineWave(freq, noteDuration, 0.15)
  );
  
  const melody = concatenateBuffers(buffers);
  
  const filename = path.join(outputDir, 'lobby-music.wav');
  saveWav(filename, melody);
  console.log('✓ Created lobby-music.wav');
}

/**
 * Generate upbeat drawing music - C-D-E-G-E-D pattern
 */
function generateDrawingMusic() {
  console.log('Generating drawing music...');
  
  // Notes: C5, D5, E5, G5, E5, D5 (upbeat melody)
  const notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33];
  const noteDuration = 0.4; // seconds (faster tempo)
  
  const buffers = notes.map(freq => 
    generateSineWave(freq, noteDuration, 0.2)
  );
  
  const melody = concatenateBuffers(buffers);
  
  const filename = path.join(outputDir, 'drawing-music.wav');
  saveWav(filename, melody);
  console.log('✓ Created drawing-music.wav');
}

/**
 * Generate countdown beep
 */
function generateCountdownBeep() {
  console.log('Generating countdown beep...');
  
  const beep = generateSineWave(800, 0.1, 0.3);
  
  const filename = path.join(outputDir, 'countdown-beep.wav');
  saveWav(filename, beep);
  console.log('✓ Created countdown-beep.wav');
}

/**
 * Generate game end victory fanfare - C-E-G ascending
 */
function generateGameEndSound() {
  console.log('Generating game end sound...');
  
  // Victory fanfare: C5, E5, G5
  const notesData = [
    [523.25, 0.15],  // C5
    [659.25, 0.15],  // E5
    [783.99, 0.3],   // G5 (longer)
  ];
  
  const buffers = notesData.map(([freq, duration]) => 
    generateSineWave(freq, duration, 0.35)
  );
  
  const fanfare = concatenateBuffers(buffers);
  
  const filename = path.join(outputDir, 'game-end.wav');
  saveWav(filename, fanfare);
  console.log('✓ Created game-end.wav');
}

// Main
console.log('🎵 Generating audio files for Monday Painter...');
console.log();

try {
  generateLobbyMusic();
  generateDrawingMusic();
  generateCountdownBeep();
  generateGameEndSound();
  
  console.log();
  console.log('✅ All audio files generated successfully!');
  console.log('📁 Files saved to: frontend/src/assets/sounds/');
  console.log();
  console.log('Note: Files are in WAV format for maximum compatibility');
} catch (error) {
  console.error('❌ Error generating audio files:', error);
  process.exit(1);
}
