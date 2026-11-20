export interface SpeakOptions {
  rate?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export interface JapaneseVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  isNeuralOrNatural: boolean;
  score: number;
}

let preferredVoiceURI = 'auto';
let activeRequestId = 0;
let activeCleanup: (() => void) | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

function isNaturalVoiceName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes('natural') ||
    lower.includes('neural') ||
    lower.includes('google') ||
    lower.includes('enhanced') ||
    lower.includes('premium') ||
    lower.includes('siri')
  );
}

function scoreJapaneseVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase();
  if (!lang.startsWith('ja')) return -1;

  const name = voice.name.toLowerCase();
  let score = lang === 'ja-jp' ? 15 : 5;

  if (name.includes('natural') || name.includes('neural')) score += 90;
  if (name.includes('google')) score += 75;
  if (name.includes('enhanced') || name.includes('premium') || name.includes('siri')) score += 65;
  if (name.includes('online')) score += 25;

  if (
    name.includes('nanami') ||
    name.includes('keita') ||
    name.includes('aoi') ||
    name.includes('mayu') ||
    name.includes('shiori') ||
    name.includes('daichi') ||
    name.includes('naoki') ||
    name.includes('o-ren') ||
    name.includes('hattori') ||
    name.includes('kyoko') ||
    name.includes('otoya')
  ) {
    score += 20;
  }

  // Cloud / neural voices typically report localService === false
  if (!voice.localService) score += 15;

  // Legacy robotic/compact voices should rank lower when natural voices exist
  if (name.includes('espeak') || name.includes('compact')) score -= 40;
  if (
    (name.includes('haruka') ||
      name.includes('ichiro') ||
      name.includes('ayumi') ||
      name.includes('sayaka')) &&
    !name.includes('natural') &&
    !name.includes('neural')
  ) {
    score -= 20;
  }

  return score;
}

export function getAvailableJapaneseVoices(): JapaneseVoiceOption[] {
  if (!isSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  const options: JapaneseVoiceOption[] = [];

  for (const voice of voices) {
    const score = scoreJapaneseVoice(voice);
    if (score >= 0) {
      options.push({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        isNeuralOrNatural: isNaturalVoiceName(voice.name) || !voice.localService,
        score,
      });
    }
  }

  return options.sort((a, b) => b.score - a.score);
}

function resolveJapaneseVoice(voiceURI?: string): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const targetURI = voiceURI ?? preferredVoiceURI;
  if (targetURI && targetURI !== 'auto') {
    const manual = voices.find((v) => v.voiceURI === targetURI);
    if (manual) return manual;
  }

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreJapaneseVoice(voice);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }
  return best;
}

export function subscribeVoicesChanged(listener: () => void): () => void {
  if (!isSpeechSupported()) return () => {};
  const synth = window.speechSynthesis;
  const handler = () => listener();

  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', handler);
    return () => synth.removeEventListener('voiceschanged', handler);
  }
  const prev = synth.onvoiceschanged;
  synth.onvoiceschanged = (ev) => {
    prev?.call(synth, ev);
    handler();
  };
  return () => {
    if (synth.onvoiceschanged) {
      synth.onvoiceschanged = prev ?? null;
    }
  };
}

export function setPreferredSpeechVoiceURI(voiceURI: string): void {
  preferredVoiceURI = voiceURI || 'auto';
}

export function getPreferredSpeechVoiceURI(): string {
  return preferredVoiceURI;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopJapaneseSpeech(): void {
  activeRequestId += 1;

  if (pendingTimer !== null) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  activeUtterance = null;

  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function speakJapanese(text: string, options: SpeakOptions = {}): void {
  const cleanText = text.trim();
  if (!isSpeechSupported() || !cleanText) {
    options.onError?.();
    return;
  }

  try {
    const synth = window.speechSynthesis;
    const needsResetDelay = synth.speaking || synth.pending;

    stopJapaneseSpeech();

    const requestId = activeRequestId;
    const startSpeak = () => {
      if (requestId !== activeRequestId) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = options.rate ?? 0.92;
      utterance.pitch = 1.0;

      const voice = resolveJapaneseVoice(options.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }

      const cleanup = () => {
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
      };

      activeCleanup = () => {
        cleanup();
        options.onEnd?.();
      };

      utterance.onstart = () => {
        if (requestId === activeRequestId) {
          options.onStart?.();
        }
      };

      utterance.onend = () => {
        cleanup();
        if (requestId === activeRequestId) {
          activeCleanup = null;
          options.onEnd?.();
        }
      };

      utterance.onerror = () => {
        cleanup();
        if (requestId === activeRequestId) {
          activeCleanup = null;
          options.onError?.();
        }
      };

      activeUtterance = utterance;
      synth.speak(utterance);
    };

    if (needsResetDelay) {
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        startSpeak();
      }, 25);
    } else {
      startSpeak();
    }
  } catch {
    options.onError?.();
  }
}
