/** Крошечный WebAudio-синтезатор для аркадных блипов. Без внешних файлов. */
export class SoundKit {
  muted = false;
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    slideTo?: number,
    delay = 0,
  ) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      /* тишина лучше падения */
    }
  }

  /** Разблокировать контекст по первому жесту пользователя. */
  unlock() {
    this.ensure();
  }

  eat() {
    this.tone(520, 0.09, "square", 0.11, 760);
  }

  bonus() {
    this.tone(660, 0.08, "square", 0.1);
    this.tone(880, 0.08, "square", 0.1, undefined, 0.07);
    this.tone(1320, 0.14, "triangle", 0.12, 1760, 0.14);
  }

  die() {
    this.tone(220, 0.42, "sawtooth", 0.13, 52);
    this.tone(160, 0.3, "square", 0.07, 40, 0.06);
  }

  start() {
    this.tone(330, 0.08, "triangle", 0.1);
    this.tone(495, 0.12, "triangle", 0.11, 660, 0.08);
  }

  pause() {
    this.tone(360, 0.06, "triangle", 0.08, 260);
  }

  resume() {
    this.tone(260, 0.06, "triangle", 0.08, 380);
  }
}
