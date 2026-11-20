import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isSpeechSupported, speakJapanese } from '../utils/speech';

interface SpeakButtonProps {
  text: string;
  label?: string;
  rate?: number;
  voiceURI?: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'subtle';
}

export function SpeakButton({
  text,
  label = '朗讀日文',
  rate = 0.92,
  voiceURI,
  size = 'md',
  variant = 'subtle',
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    setSpeaking(false);
  }, [text]);

  const handleSpeak = () => {
    speakJapanese(text, {
      rate,
      voiceURI,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const sizeClasses =
    size === 'sm' ? 'min-h-[40px] px-3 py-1.5 text-xs' : 'min-h-[44px] px-4 py-2 text-sm';

  const colorClasses =
    variant === 'primary'
      ? speaking
        ? 'bg-blue-700 text-white border-blue-700'
        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
      : speaking
        ? 'bg-blue-50 text-blue-700 border-blue-300'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900';

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!supported}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-colors active:scale-[0.98] whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer ${sizeClasses} ${colorClasses}`}
    >
      <Volume2 className={`w-4 h-4 ${speaking ? 'text-current' : ''}`} />
      <span>{speaking ? '朗讀中' : label}</span>
    </button>
  );
}
