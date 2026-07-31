import { useCallback } from "react";

export function useOrderSound() {
  const playChime = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Play pleasant "Ting-Ting-Ting!" triad chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      playTone(523.25, 0.0, 0.4);
      playTone(659.25, 0.15, 0.4);
      playTone(784.00, 0.3, 0.6);
    } catch (err) {
      console.warn("Không thể phát âm thanh thông báo:", err);
    }
  }, []);

  return { playChime };
}
