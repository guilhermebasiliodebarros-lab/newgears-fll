import assert from 'node:assert/strict';
import { chooseGiroVoice, giroSpeechChunks, giroVoicePreferences, portugueseGiroVoices } from '../src/utils/giroSpeech.js';

export async function runGiroSpeechTests() {
  const voices = [
    { name: 'English Natural', lang: 'en-US', voiceURI: 'en', localService: false },
    { name: 'Helena', lang: 'pt-BR', voiceURI: 'local-br', localService: true },
    { name: 'Google português do Brasil', lang: 'pt-BR', voiceURI: 'google-br', localService: false },
    { name: 'Francisca Online (Natural)', lang: 'pt-BR', voiceURI: 'natural-br', localService: false },
    { name: 'Portugal Natural', lang: 'pt-PT', voiceURI: 'natural-pt', localService: false },
  ];
  assert.equal(chooseGiroVoice(voices).voiceURI, 'natural-br');
  assert.equal(chooseGiroVoice(voices, 'google-br').voiceURI, 'google-br', 'The selected voice takes precedence over automatic ranking');
  assert.equal(chooseGiroVoice(voices, 'auto', false).voiceURI, 'local-br', 'An automatic offline reading selects a local Portuguese voice');
  assert.equal(chooseGiroVoice(voices, 'removed-voice').voiceURI, 'natural-br');
  assert.equal(portugueseGiroVoices([...voices, voices[1]]).length, 4);
  assert.equal(chooseGiroVoice([]), undefined);
  assert.deepEqual(giroVoicePreferences(null), { voice: 'auto', rate: .98 });
  assert.equal(giroVoicePreferences({ rate: 3 }).rate, 1.2);
  const text = 'Giro · New Gears. +20 Gears conquistados! O protótipo V1.2 foi testado. '.repeat(15);
  const chunks = giroSpeechChunks(text);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 220));
  assert.match(chunks.join(' '), /Você ganhou 20 Gears\./);
  assert.match(chunks.join(' '), /V1\.2 foi testado/);
  assert.equal(giroSpeechChunks('a'.repeat(501)).join('').length, 501, 'Even unusually long words are retained');
  assert.deepEqual(giroSpeechChunks(''), []);
}
