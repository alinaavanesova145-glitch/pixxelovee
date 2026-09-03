/**
 * Thin Web Audio API wrapper for the story viewer.
 *
 * Background music streams through a plain <audio> element (simple, buffers
 * as it plays). One-shot hotspot sounds go through decoded AudioBuffers on an
 * AudioContext for low-latency, overlapping playback. Nothing plays until
 * `unlock()` runs from a real user gesture — browsers block autoplay otherwise.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private sfxBuffers = new Map<string, AudioBuffer>();
  private unlocked = false;

  async unlock() {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.ctx.destination);
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.unlocked = true;
  }

  async playMusic(url: string, volume = 0.4, loop = true) {
    if (!this.musicEl) {
      this.musicEl = new Audio(url);
      this.musicEl.loop = loop;
      this.musicEl.volume = volume;
    }
    try {
      await this.musicEl.play();
    } catch {
      // Still blocked (rare, if unlock() wasn't a direct gesture handler) — ignore.
    }
  }

  stopMusic() {
    this.musicEl?.pause();
    if (this.musicEl) this.musicEl.currentTime = 0;
  }

  async preloadSfx(urls: string[]) {
    if (!this.ctx) return;
    await Promise.all(
      urls.map(async (url) => {
        if (this.sfxBuffers.has(url)) return;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.sfxBuffers.set(url, buffer);
      })
    );
  }

  playSfx(url: string, volume = 0.8) {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.sfxBuffers.get(url);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.masterGain);
    source.start(0);
  }

  destroy() {
    this.stopMusic();
    this.sfxBuffers.clear();
    this.ctx?.close();
    this.ctx = null;
    this.unlocked = false;
  }
}
