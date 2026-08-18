const STORAGE_KEY = 'resq-notification-sound-enabled';

export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(STORAGE_KEY) !== 'false';
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function playNotificationChime(): void {
  if (typeof window === 'undefined' || !isNotificationSoundEnabled()) return;
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
  gain.connect(context.destination);

  const first = context.createOscillator();
  first.type = 'sine';
  first.frequency.setValueAtTime(660, context.currentTime);
  first.connect(gain);
  first.start(context.currentTime);
  first.stop(context.currentTime + 0.18);

  const second = context.createOscillator();
  second.type = 'sine';
  second.frequency.setValueAtTime(880, context.currentTime + 0.16);
  second.connect(gain);
  second.start(context.currentTime + 0.16);
  second.stop(context.currentTime + 0.42);

  window.setTimeout(() => void context.close(), 550);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
