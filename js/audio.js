/* Tiny WebAudio synth — every sound on the site is generated, no audio files. */
window.LordAudio = (() => {
  const KEY = '9lord_mute';
  let ctx = null, master = null, noiseBuf = null;
  let muted = localStorage.getItem(KEY) === '1';

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.7;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer() {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 1.5;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function tone({ freq = 440, type = 'sine', dur = 0.2, gain = 0.3, attack = 0.005, release = 0.08, at = 0, detune = 0, slideTo = null }) {
    if (!ensure()) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.setValueAtTime(gain, t + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise({ dur = 0.05, gain = 0.3, lp = 4000, hp = 100, at = 0, decay = true }) {
    if (!ensure()) return;
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = lp;
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    if (decay) g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(hpf).connect(lpf).connect(g).connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  return {
    get muted() { return muted; },
    setMuted(v) {
      muted = !!v; localStorage.setItem(KEY, muted ? '1' : '0');
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.7, ctx.currentTime, 0.02);
    },
    unlock() { ensure(); },
    // mechanical rocker switch
    click() {
      noise({ dur: 0.025, gain: 0.5, lp: 2600, hp: 300 });
      tone({ freq: 140, type: 'triangle', dur: 0.07, gain: 0.25 });
      noise({ dur: 0.04, gain: 0.25, lp: 1800, hp: 200, at: 0.06 });
    },
    // CRT degauss thunk + high-voltage rise
    degauss() {
      tone({ freq: 48, type: 'sine', dur: 0.55, gain: 0.35, release: 0.45 });
      noise({ dur: 0.35, gain: 0.12, lp: 700, hp: 60 });
      tone({ freq: 2200, type: 'sine', dur: 0.9, gain: 0.012, attack: 0.3, release: 0.5, slideTo: 9000 });
    },
    // the startup chord (C major, warm & slow decay)
    chime() {
      const root = 130.81; // C3
      const chord = [1, 1.25, 1.5, 2]; // C E G C
      chord.forEach((r, i) => {
        tone({ freq: root * r, type: 'sine', dur: 2.2, gain: 0.16, attack: 0.012, release: 1.9, at: i * 0.004 });
        tone({ freq: root * r, type: 'triangle', dur: 1.6, gain: 0.035, attack: 0.012, release: 1.4, detune: 4 });
        tone({ freq: root * r * 2, type: 'sine', dur: 1.2, gain: 0.02, attack: 0.02, release: 1.0, detune: -3 });
      });
    },
    key() { noise({ dur: 0.014, gain: 0.14, lp: 7000, hp: 900 }); },
    enter() { noise({ dur: 0.02, gain: 0.2, lp: 5000, hp: 500 }); tone({ freq: 220, type: 'triangle', dur: 0.03, gain: 0.08 }); },
    pop() { tone({ freq: 740, type: 'sine', dur: 0.05, gain: 0.09 }); tone({ freq: 1480, type: 'sine', dur: 0.03, gain: 0.03 }); },
    close() { tone({ freq: 520, type: 'sine', dur: 0.05, gain: 0.08 }); },
    beep() { tone({ freq: 880, type: 'square', dur: 0.1, gain: 0.07 }); },
    error() { tone({ freq: 196, type: 'square', dur: 0.14, gain: 0.07 }); tone({ freq: 147, type: 'square', dur: 0.18, gain: 0.07, at: 0.13 }); },
    off() {
      tone({ freq: 260, type: 'sine', dur: 0.45, gain: 0.22, release: 0.35, slideTo: 30 });
      noise({ dur: 0.08, gain: 0.3, lp: 2000, hp: 200, at: 0.42 });
    },
  };
})();
