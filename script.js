/**
 * ❤️ POUR TRINIX ❤️ — script.js
 * Premium Cinematic Narrative Engine
 * 
 * Performance: 60FPS GPU-Accelerated Simulations
 * Architecture: Class-Based Modular ES2023
 * Logic: Promise-Based Story Flow
 */

"use strict";

/* ==========================================================================
   CONFIGURATION & CONSTANTS
   ========================================================================== */
const CONFIG = {
    PASSWORD: "1810",
    TYPING_SPEED: 35,
    PAUSE_SHORT: 500,
    PAUSE_LONG: 1000,
    PARTICLE_COUNT: 24,
    SPARK_COUNT: 40,
    SHATTER_COUNT: 70
};

/* ==========================================================================
   UTILITIES
   ========================================================================== */
const Utils = {
    $: (sel, ctx = document) => ctx.querySelector(sel),
    $$: (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel)),
    rand: (min, max) => Math.random() * (max - min) + min,
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    
    // Animation frame-rate independent multiplier
    getDT: (lastTime) => {
        const now = performance.now();
        const dt = (now - lastTime) / 16.667;
        return { now, dt: Math.min(dt, 2) }; // Cap dt to prevent jumps
    },

    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    /**
     * Wait for a specific duration (Promise-based)
     */
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Global interaction unlocker
     */
    onFirstInteraction(handler) {
        const events = ['pointerdown', 'keydown', 'touchstart'];
        const fire = () => {
            events.forEach(ev => document.removeEventListener(ev, fire));
            handler();
        };
        events.forEach(ev => document.addEventListener(ev, fire, { once: true, passive: true }));
    }
};

/* ==========================================================================
   SKY FIELD (Canvas) — Starfield & Gold Dust
   ========================================================================== */
class SkyField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas?.getContext('2d');
        if (!this.ctx) return;

        this.stars = [];
        this.sparkles = [];
        this.lastTime = performance.now();
        this.rafId = null;
        this.isRunning = false;

        this.init();
    }

    init() {
        this.resize();
        this.seed();
        this.start();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
    }

    seed() {
        const count = Math.min(250, Math.floor((window.innerWidth * window.innerHeight) / 6000));
        this.stars = Array.from({ length: count }, () => ({
            x: Utils.rand(0, window.innerWidth),
            y: Utils.rand(0, window.innerHeight),
            r: Utils.rand(0.5, 1.8),
            opacity: Utils.rand(0.3, 0.8),
            blinkSpeed: Utils.rand(0.01, 0.03),
            phase: Utils.rand(0, Math.PI * 2)
        }));

        this.sparkles = Array.from({ length: 20 }, () => ({
            x: Utils.rand(0, window.innerWidth),
            y: Utils.rand(0, window.innerHeight),
            r: Utils.rand(1, 2.5),
            vx: Utils.rand(-0.1, 0.1),
            vy: Utils.rand(-0.2, -0.05),
            phase: Utils.rand(0, Math.PI * 2)
        }));
    }

    draw(t) {
        const { ctx } = this;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw Stars
        this.stars.forEach(s => {
            const twinkle = Math.sin(t * s.blinkSpeed + s.phase);
            ctx.globalAlpha = Utils.clamp(s.opacity + twinkle * 0.3, 0, 1);
            ctx.fillStyle = '#fffaf0';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Gold Sparkles
        this.sparkles.forEach(p => {
            if (!Utils.prefersReducedMotion) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) p.y = window.innerHeight + 10;
            }
            const glow = (Math.sin(t * 0.002 + p.phase) + 1) / 2;
            ctx.globalAlpha = 0.2 + glow * 0.6;
            ctx.fillStyle = '#e3c574';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }

    loop = (now) => {
        if (!this.isRunning) return;
        this.draw(now);
        this.rafId = requestAnimationFrame(this.loop);
    };

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        if (Utils.prefersReducedMotion) {
            this.draw(0);
        } else {
            this.rafId = requestAnimationFrame(this.loop);
        }
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }
}

/* ==========================================================================
   PARTICLE LAYER — DOM Effects
   ========================================================================== */
class ParticleLayer {
    constructor(container) {
        this.container = container;
        this.intervals = [];
        this.glyphs = {
            heart: ['❤️', '💖', '💕', '💗'],
            petal: ['🌸', '🌹', '✨'],
            butterfly: ['🦋']
        };
    }

    spawn(type, options = {}) {
        if (!this.container) return;
        
        const el = document.createElement('div');
        const glyphs = this.glyphs[type];
        el.className = `fx-${type}`;
        el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        
        const x = options.x ?? Utils.rand(10, 90);
        const duration = options.duration ?? Utils.rand(6000, 10000);
        const drift = Utils.rand(-80, 80);
        
        el.style.left = `${x}vw`;
        el.style.bottom = `-10%`;
        
        this.container.appendChild(el);

        const anim = el.animate([
            { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 0 },
            { transform: `translate3d(${drift * 0.5}px, -50vh, 0) rotate(10deg)`, opacity: 1, offset: 0.2 },
            { transform: `translate3d(${drift}px, -110vh, 0) rotate(20deg)`, opacity: 0 }
        ], {
            duration,
            easing: 'ease-in-out'
        });

        anim.onfinish = () => el.remove();
    }

    sparkBurst(cx, cy, count = CONFIG.SPARK_COUNT) {
        const n = Utils.prefersReducedMotion ? count / 3 : count;
        for (let i = 0; i < n; i++) {
            const el = document.createElement('div');
            el.className = 'fx-spark';
            el.style.left = `${cx}px`;
            el.style.top = `${cy}px`;
            this.container.appendChild(el);

            const angle = Utils.rand(0, Math.PI * 2);
            const dist = Utils.rand(50, 200);
            
            el.animate([
                { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
                { transform: `translate3d(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px, 0) scale(0)`, opacity: 0 }
            ], {
                duration: Utils.rand(800, 1500),
                easing: 'cubic-bezier(0.2, 1, 0.3, 1)'
            }).onfinish = () => el.remove();
        }
    }

    heartRain(count = CONFIG.PARTICLE_COUNT) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.spawn('heart'), i * 150);
        }
    }

    startAmbient() {
        if (Utils.prefersReducedMotion) return;
        this.intervals.push(setInterval(() => this.spawn('heart'), 3000));
        this.intervals.push(setInterval(() => this.spawn('petal'), 2500));
    }

    stopAmbient() {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
    }
}

/* ==========================================================================
   CHARACTER (ILara SVG)
   ========================================================================== */
class Character {
    constructor(template) {
        this.node = template.content.firstElementChild.cloneNode(true);
        this.currentPose = null;
    }

    mount(slotId, pose) {
        const slot = document.getElementById(slotId);
        if (!slot) return;
        
        slot.innerHTML = '';
        slot.appendChild(this.node);
        this.setPose(pose);
    }

    setPose(pose) {
        if (this.currentPose) this.node.classList.remove(this.currentPose);
        this.node.classList.add(pose);
        this.currentPose = pose;
    }

    setTalking(state) {
        this.node.classList.toggle('is-talking', state);
    }

    setBlinking(state) {
        this.node.classList.toggle('is-blinking', state);
    }
}

/* ==========================================================================
   NARRATIVE / TYPEWRITER ENGINE
   ========================================================================== */
class NarrativeEngine {
    constructor(character) {
        this.character = character;
        this.isTyping = false;
        this.abortController = null;
    }

    async type(el, text, options = {}) {
        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();
        const { signal } = this.abortController;

        this.isTyping = true;
        el.innerHTML = '';
        el.classList.add('typing');
        
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        el.appendChild(cursor);

        if (options.talk) this.character.setTalking(true);

        const chars = Array.from(text);
        let currentText = "";

        for (const char of chars) {
            if (signal.aborted) return;
            currentText += char;
            // Use textContent for safety, then re-append cursor
            const textNode = document.createTextNode(currentText);
            el.innerHTML = '';
            el.appendChild(textNode);
            el.appendChild(cursor);
            
            await Utils.wait(options.speed || CONFIG.TYPING_SPEED);
        }

        if (options.talk) this.character.setTalking(false);
        this.isTyping = false;
        el.classList.remove('typing');
    }

    async playSequence(el, lines, options = {}) {
        for (const line of lines) {
            await this.type(el, line, options);
            await Utils.wait(options.delay || CONFIG.PAUSE_LONG);
        }
    }
}

/* ==========================================================================
   AUDIO CONTROLLER
   ========================================================================== */
class AudioController {
    constructor() {
        this.music = Utils.$('#bg-music');
        this.chime = Utils.$('#chime-sound');
        this.muteBtn = Utils.$('#mute-btn');
        this.isMuted = false;

        this.muteBtn?.addEventListener('click', () => this.toggleMute());
    }

    playMusic() {
        if (!this.music) return;
        this.music.volume = 0;
        this.music.play().then(() => {
            this.fadeAudio(this.music, 0.4, 2000);
            this.muteBtn?.classList.add('is-visible');
        }).catch(err => console.log("Audio waiting for interaction"));
    }

    playChime() {
        if (this.chime) {
            this.chime.volume = 0.5;
            this.chime.play().catch(() => {});
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.music.muted = this.isMuted;
        this.chime.muted = this.isMuted;
        this.muteBtn.setAttribute('aria-pressed', this.isMuted);
        this.muteBtn.querySelector('.mute-icon').textContent = this.isMuted ? '🔇' : '🔊';
    }

    fadeAudio(audio, targetVol, duration) {
        const startVol = audio.volume;
        const steps = 20;
        const increment = (targetVol - startVol) / steps;
        let count = 0;

        const interval = setInterval(() => {
            audio.volume = Utils.clamp(audio.volume + increment, 0, 1);
            count++;
            if (count >= steps) clearInterval(interval);
        }, duration / steps);
    }
}

/* ==========================================================================
   PASSWORD SYSTEM
   ========================================================================== */
class PasswordSystem {
    constructor(onSuccess, particleLayer) {
        this.onSuccess = onSuccess;
        this.particles = particleLayer;
        this.input = "";
        this.isLocked = false;
        
        this.dots = Utils.$$('.dot');
        this.msgEl = Utils.$('#password-msg');
        this.keypad = Utils.$('#keypad');

        this.init();
    }

    init() {
        this.keypad?.addEventListener('click', (e) => {
            const key = e.target.closest('.key');
            if (key) this.handleInput(key.dataset.key);
        });

        // Physical Keyboard Support
        window.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName === 'INPUT') return;
            if (e.key >= '0' && e.key <= '9') this.handleInput(e.key);
            if (e.key === 'Backspace') this.handleInput('del');
        });
    }

    handleInput(key) {
        if (this.isLocked) return;

        if (key === 'del') {
            this.input = this.input.slice(0, -1);
        } else if (this.input.length < 4) {
            this.input += key;
        }

        this.updateUI();

        if (this.input.length === 4) {
            this.checkPassword();
        }
    }

    updateUI() {
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.input.length);
        });
        if (this.msgEl) this.msgEl.innerHTML = '&nbsp;';
    }

    async checkPassword() {
        this.isLocked = true;
        await Utils.wait(300);

        if (this.input === CONFIG.PASSWORD) {
            this.onSuccess();
        } else {
            this.handleError();
        }
    }

    handleError() {
        const stage = Utils.$('#password-dots');
        stage?.classList.add('shake');
        if (this.msgEl) this.msgEl.textContent = "Ce n'est pas encore ça...";
        
        navigator.vibrate?.([50, 50, 50]);

        setTimeout(() => {
            stage?.classList.remove('shake');
            this.input = "";
            this.updateUI();
            this.isLocked = false;
        }, 600);
    }
}

/* ==========================================================================
   SHATTER FIELD (Canvas) — Final Explosion
   ========================================================================== */
class ShatterField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas?.getContext('2d');
        this.particles = [];
        this.active = false;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }

    burst(x, y) {
        this.resize();
        this.active = true;
        const count = Utils.prefersReducedMotion ? 20 : CONFIG.SHATTER_COUNT;
        
        this.particles = Array.from({ length: count }, () => {
            const angle = Utils.rand(0, Math.PI * 2);
            const speed = Utils.rand(3, 8);
            return {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Utils.rand(15, 30),
                life: 1,
                decay: Utils.rand(0.01, 0.02),
                rot: Utils.rand(0, Math.PI),
                vRot: Utils.rand(-0.1, 0.1)
            };
        });

        this.loop();
    }

    loop = () => {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.life -= p.decay;
            p.rot += p.vRot;

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rot);
            this.ctx.font = `${p.size}px serif`;
            this.ctx.fillText('❤️', -p.size/2, p.size/2);
            this.ctx.restore();
        });

        this.particles = this.particles.filter(p => p.life > 0);
        if (this.particles.length > 0) {
            requestAnimationFrame(this.loop);
        } else {
            this.active = false;
        }
    };
}

/* ==========================================================================
   CORE APPLICATION ENGINE
   ========================================================================== */
class App {
    constructor() {
        this.initModules();
        this.initEvents();
        this.runLoader();
    }

    initModules() {
        this.character = new Character(Utils.$('#ilara-template'));
        this.particles = new ParticleLayer(Utils.$('#fx-layer'));
        this.sky = new SkyField(Utils.$('#sky-canvas'));
        this.shatter = new ShatterField(Utils.$('#shatter-canvas'));
        this.engine = new NarrativeEngine(this.character);
        this.audio = new AudioController();
        this.password = new PasswordSystem(() => this.transitionTo('unlock'), this.particles);
        
        this.currentScene = 'loader';
    }

    initEvents() {
        // Global Resize
        window.addEventListener('resize', () => {
            this.sky.resize();
            this.sky.seed();
        });

        // Visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sky.stop();
                this.particles.stopAmbient();
            } else {
                this.sky.start();
                this.particles.startAmbient();
            }
        });

        // Audio Activation
        Utils.onFirstInteraction(() => this.audio.playMusic());

        // Opening Advance
        Utils.$('#opening-next').addEventListener('click', () => this.advanceOpening());
        
        // Envelope Interaction
        const env = Utils.$('#envelope');
        env.addEventListener('click', () => this.openEnvelope());
        env.addEventListener('keypress', (e) => e.key === 'Enter' && this.openEnvelope());

        // Letter Advance
        Utils.$('#letter-continue').addEventListener('click', () => this.transitionTo('secret'));

        // Secret Heart
        Utils.$('#secret-heart').addEventListener('click', (e) => this.triggerSecret(e));
    }

    transitionTo(sceneId) {
        const scenes = Utils.$$('.scene');
        scenes.forEach(s => s.classList.remove('is-active'));
        
        const target = Utils.$(`#scene-${sceneId}`);
        if (target) {
            target.classList.add('is-active');
            this.currentScene = sceneId;
            this.onSceneEnter(sceneId);
        }
    }

    async onSceneEnter(id) {
        switch(id) {
            case 'opening':
                this.character.mount('slot-opening', 'pose-envelope');
                this.playOpeningSequence();
                break;
            case 'unlock':
                this.audio.playChime();
                this.particles.sparkBurst(window.innerWidth / 2, window.innerHeight / 2);
                this.character.mount('slot-unlock', 'pose-clap');
                await this.engine.playSequence(Utils.$('#unlock-dialogue-text'), [
                    'Bravo ❤️', 'Je savais que tu y arriverais', 'Viens', 'J’ai quelque chose pour toi'
                ]);
                await Utils.wait(CONFIG.PAUSE_LONG);
                this.transitionTo('present');
                break;
            case 'present':
                this.character.mount('slot-present', 'pose-present');
                await this.engine.playSequence(Utils.$('#present-dialogue-text'), [
                    'Cette lettre est très précieuse', 'Elle contient un petit morceau de mon cœur', 'Lis-la doucement'
                ]);
                await Utils.wait(CONFIG.PAUSE_LONG);
                this.transitionTo('envelope');
                break;
            case 'letter':
                this.playLetter();
                break;
            case 'ending':
                this.playEnding();
                break;
        }
    }

    /* Scene Specific Logic */

    async runLoader() {
        const bar = Utils.$('#loader-fill');
        let progress = 0;
        
        const update = async () => {
            progress += Utils.rand(5, 15);
            if (bar) bar.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress < 100) {
                setTimeout(update, Utils.rand(150, 400));
            } else {
                await Utils.wait(500);
                this.transitionTo('opening');
            }
        };
        update();
    }

    async playOpeningSequence() {
        this.openingLines = [
            'Bonjour Trinix ❤️',
            "Moi c'est ILara",
            'Je suis vraiment heureuse de te voir aujourd’hui',
            'J’ai préparé une petite surprise spécialement pour toi',
            'J’y ai mis beaucoup d’amour',
            'Mais avant de continuer',
            'Il faut me prouver que c’est bien toi'
        ];
        this.openingIdx = 0;
        this.showNextOpeningLine();
    }

    async showNextOpeningLine() {
        const btn = Utils.$('#opening-next');
        const textEl = Utils.$('#opening-dialogue-text');
        
        btn.classList.remove('is-visible');
        await this.engine.type(textEl, this.openingLines[this.openingIdx], { talk: true });
        
        this.openingIdx++;
        btn.classList.add('is-visible');
    }

    advanceOpening() {
        if (this.engine.isTyping) return;
        if (this.openingIdx < this.openingLines.length) {
            this.showNextOpeningLine();
        } else {
            this.transitionTo('password');
        }
    }

    async openEnvelope() {
        const env = Utils.$('#envelope');
        if (env.classList.contains('is-open')) return;

        env.classList.add('is-open');
        this.audio.playChime();
        this.particles.heartRain(10);
        
        await Utils.wait(1500);
        this.transitionTo('letter');
    }

    async playLetter() {
        const container = Utils.$('#letter-text');
        const paper = Utils.$('#paper');
        const lines = [
            "Tu sais ce qui est drôle",
            "Avant toi je pensais que toutes les journées se ressemblaient",
            "Puis tu es arrivé",
            "Et sans même t'en rendre compte tu as changé beaucoup de choses",
            "Aujourd'hui il suffit que ton prénom apparaisse sur mon téléphone pour que je souris toute seule",
            "Tu as réussi à voler mon cœur sans même t'en rendre compte",
            "Et franchement",
            "Je n'ai jamais eu envie de le récupérer",
            "Il est beaucoup mieux avec toi",
            "J'aime ton sourire",
            "J'aime ta façon de parler",
            "J'aime nos conversations",
            "Même quand tu me fais rire avec les choses les plus absurdes",
            "Merci d'être entré dans ma vie",
            "Merci d'être toi",
            "Merci de rendre mon monde plus beau",
            "Si un jour tu doutes de ce que je ressens",
            "Relis simplement cette lettre",
            "Parce que chaque mot vient sincèrement de mon cœur",
            "Je t'aime infiniment ❤️",
            "ILara"
        ];

        for (const line of lines) {
            const p = document.createElement('p');
            container.appendChild(p);
            await this.engine.type(p, line, { speed: 40 });
            
            // Auto-scroll paper
            paper.scrollTo({ top: paper.scrollHeight, behavior: 'smooth' });
            await Utils.wait(CONFIG.PAUSE_SHORT);
        }

        Utils.$('#letter-continue').classList.add('is-visible');
    }

    triggerSecret(e) {
        const heart = e.currentTarget;
        if (heart.classList.contains('is-hidden')) return;

        heart.classList.add('is-hidden');
        this.audio.playChime();
        this.shatter.burst(e.clientX, e.clientY);
        
        setTimeout(() => this.transitionTo('ending'), 2000);
    }

    async playEnding() {
        this.character.mount('slot-ending', 'pose-rose');
        this.particles.heartRain(20);
        
        await this.engine.playSequence(Utils.$('#ending-dialogue-text'), [
            'Alors', 'Est-ce que j’ai réussi à te faire sourire ?',
            'Parce que c’était exactement mon objectif',
            'Merci d’avoir pris le temps de lire mon cœur',
            'À bientôt mon Trinix ❤️'
        ]);

        this.character.setPose('pose-wave');
    }
}

// Start Application
window.addEventListener('DOMContentLoaded', () => {
    window.Experience = new App();
});
