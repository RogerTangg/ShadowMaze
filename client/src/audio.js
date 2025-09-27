/**
 * Game Audio System
 * Handles background music and sound effects
 */

class GameAudio {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
    }
    
    /**
     * Initialize audio system
     */
    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load sounds
            await this.loadSounds();
            
            // Start background music
            this.startBackgroundMusic();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            // Fallback to HTML5 audio
            this.initHTMLAudio();
        }
    }
    
    /**
     * Load all game sounds
     */
    async loadSounds() {
        const soundFiles = {
            background: '/sounds/background.mp3',
            hit: '/sounds/hit.mp3',
            success: '/sounds/success.mp3'
        };
        
        const loadPromises = Object.entries(soundFiles).map(async ([name, url]) => {
            try {
                const audio = new Audio(url);
                audio.preload = 'auto';
                audio.volume = name === 'background' ? this.musicVolume : this.sfxVolume;
                
                // Wait for audio to be ready
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                    audio.load();
                });
                
                this.sounds[name] = audio;
                console.log(`Loaded sound: ${name}`);
            } catch (error) {
                console.warn(`Failed to load sound ${name}:`, error);
                // Create silent fallback
                this.sounds[name] = null;
            }
        });
        
        await Promise.all(loadPromises);
    }
    
    /**
     * Initialize HTML5 audio fallback
     */
    initHTMLAudio() {
        console.log('Using HTML5 audio fallback');
        
        // Create basic audio elements
        const soundFiles = {
            background: '/sounds/background.mp3',
            hit: '/sounds/hit.mp3',
            success: '/sounds/success.mp3'
        };
        
        Object.entries(soundFiles).forEach(([name, url]) => {
            const audio = new Audio(url);
            audio.volume = name === 'background' ? this.musicVolume : this.sfxVolume;
            audio.preload = 'auto';
            this.sounds[name] = audio;
        });
    }
    
    /**
     * Start background music
     */
    startBackgroundMusic() {
        if (this.sounds.background && !this.isMuted) {
            try {
                this.sounds.background.loop = true;
                this.sounds.background.volume = this.musicVolume * this.masterVolume;
                
                // Play with user gesture handling
                const playPromise = this.sounds.background.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('Background music autoplay prevented:', error);
                        // Will try to play when user interacts
                        document.addEventListener('click', this.tryPlayBackgroundMusic.bind(this), { once: true });
                        document.addEventListener('touchstart', this.tryPlayBackgroundMusic.bind(this), { once: true });
                        document.addEventListener('keydown', this.tryPlayBackgroundMusic.bind(this), { once: true });
                    });
                }
            } catch (error) {
                console.warn('Background music play failed:', error);
            }
        }
    }
    
    /**
     * Try to play background music after user interaction
     */
    tryPlayBackgroundMusic() {
        if (this.sounds.background && !this.isMuted) {
            this.sounds.background.play().catch(() => {
                // Ignore if still can't play
            });
        }
    }
    
    /**
     * Play a sound effect
     */
    playSound(soundName, volume = 1.0) {
        if (this.isMuted || !this.sounds[soundName]) {
            return;
        }
        
        try {
            const sound = this.sounds[soundName];
            
            if (soundName === 'background') {
                // Handle background music
                sound.currentTime = 0;
                sound.volume = this.musicVolume * this.masterVolume * volume;
                sound.play().catch(() => {});
            } else {
                // Handle sound effects
                // Clone audio for overlapping sounds
                const soundClone = sound.cloneNode();
                soundClone.volume = this.sfxVolume * this.masterVolume * volume;
                
                // Play and clean up
                soundClone.play().then(() => {
                    // Clean up after playing
                    setTimeout(() => {
                        soundClone.remove();
                    }, soundClone.duration * 1000 + 100);
                }).catch(error => {
                    console.log(`Sound ${soundName} play failed:`, error);
                });
            }
        } catch (error) {
            console.warn(`Failed to play sound ${soundName}:`, error);
        }
    }
    
    /**
     * Stop a sound
     */
    stopSound(soundName) {
        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName].pause();
                this.sounds[soundName].currentTime = 0;
            } catch (error) {
                console.warn(`Failed to stop sound ${soundName}:`, error);
            }
        }
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Mute all sounds
            Object.values(this.sounds).forEach(sound => {
                if (sound) {
                    sound.volume = 0;
                }
            });
            
            // Stop background music
            this.stopSound('background');
        } else {
            // Restore volumes
            Object.entries(this.sounds).forEach(([name, sound]) => {
                if (sound) {
                    const baseVolume = name === 'background' ? this.musicVolume : this.sfxVolume;
                    sound.volume = baseVolume * this.masterVolume;
                }
            });
            
            // Restart background music
            this.startBackgroundMusic();
        }
        
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (!this.isMuted) {
            Object.entries(this.sounds).forEach(([name, sound]) => {
                if (sound) {
                    const baseVolume = name === 'background' ? this.musicVolume : this.sfxVolume;
                    sound.volume = baseVolume * this.masterVolume;
                }
            });
        }
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.sounds.background && !this.isMuted) {
            this.sounds.background.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    /**
     * Set sound effects volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Cleanup audio resources
     */
    cleanup() {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.src = '';
            }
        });
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    } 
}
