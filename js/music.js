class MusicPlayer {
    constructor() {
        this.tracks = [
            { title: "Starboy - The Weeknd", file: "music/Starboy - The Weeknd.mp3" },
            { title: "Blinding Lights - The Weeknd", file: "music/BlindingLights.mp3" },
            { title: "Dhurandhar Title Track", file: "music/Dhurandhar Title Track.mp3" },
            { title: "Firestorm", file: "music/Firestorm.mp3" },
            { title: "Guns & Roses - Thaman S", file: "music/Guns and Roses - Thaman S.mp3" },
            { title: "Cry For Me - The Weeknd", file: "music/The Weeknd - Cry For Me (Audio) - TheWeekndVEVO.mp3" },
            { title: "Deadly Katana - Thaman S", file: "music/Deadly Katana - Thaman S.mp3" },
            { title: "Pathikichu", file: "music/Pathikichu.mp3" },
            { title: "Sarkaru Raa", file: "music/Sarkaru Raa.mp3" }
        ];
        this.currentTrackIndex = 0;
        this.audio = new Audio();
        this.isPlaying = false;

        // DOM Elements
        this.domContainer = document.getElementById('music-player');
        this.domTitleDesktop = document.getElementById('music-title-desktop');
        this.domTitleMini = document.getElementById('music-title-mini');
        this.domPlayBtn = document.getElementById('music-play');
        this.domPlayBtnMini = document.getElementById('btn-play-mini');
        this.domPrevBtn = document.getElementById('music-prev');
        this.domNextBtn = document.getElementById('music-next');
        this.domVolume = document.getElementById('music-volume');
        this.domVisualizer = document.getElementById('music-visualizer');

        this.init();
    }

    init() {
        if (!this.domContainer) {
            console.error("Music Player: Container not found!");
            return;
        }

        console.log("Music Player: Initializing...");
        // Load first track
        this.loadTrack(this.currentTrackIndex);

        // Event Listeners
        this.domPlayBtn.addEventListener('click', () => this.togglePlay());
        this.domPrevBtn.addEventListener('click', () => this.prevTrack());
        this.domNextBtn.addEventListener('click', () => this.nextTrack());

        this.domVolume.addEventListener('input', (e) => {
            this.audio.volume = e.target.value;
        });

        // Auto-next
        this.audio.addEventListener('ended', () => this.nextTrack());

        // Error handling
        this.audio.addEventListener('error', (e) => {
            console.error("Music Player Error:", e);
            if (this.domTitleDesktop) this.domTitleDesktop.innerText = "Error Loading Track";
            if (this.domTitleMini) this.domTitleMini.innerText = "Error Loading Track";
        });

        // Visualizer Animation Loop
        this.animateVisualizer();
    }

    loadTrack(index) {
        if (index < 0) index = this.tracks.length - 1;
        if (index >= this.tracks.length) index = 0;

        this.currentTrackIndex = index;
        this.audio.src = this.tracks[this.currentTrackIndex].file;
        const songTitle = this.tracks[this.currentTrackIndex].title;

        if (this.domTitleDesktop) this.domTitleDesktop.innerText = songTitle;
        if (this.domTitleMini) this.domTitleMini.innerText = songTitle;

        console.log("Loading track:", songTitle, this.tracks[this.currentTrackIndex].file);

        if (this.isPlaying) {
            this.audio.play().then(() => {
                console.log("Playback started");
            }).catch(e => {
                console.warn("Autoplay blocked or playback error:", e);
            });
        }
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.isPlaying = true;
                if (this.domPlayBtn) this.domPlayBtn.innerHTML = "❚❚"; // Pause icon
                if (this.domPlayBtnMini) this.domPlayBtnMini.innerHTML = "❚❚";
                this.domContainer.classList.add('playing');
                // Notify parent window that in-app music started
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'MUSIC_STARTED', source: 'car-game' }, '*');
                }
            }).catch(e => console.error("Play failed:", e));
        } else {
            this.audio.pause();
            this.isPlaying = false;
            if (this.domPlayBtn) this.domPlayBtn.innerHTML = "▶"; // Play icon
            if (this.domPlayBtnMini) this.domPlayBtnMini.innerHTML = "▶";
            this.domContainer.classList.remove('playing');
        }
    }

    // Pause music (called externally via postMessage)
    pauseMusic() {
        if (!this.audio.paused) {
            this.audio.pause();
            this.isPlaying = false;
            this.domPlayBtn.innerHTML = "▶";
            this.domContainer.classList.remove('playing');
        }
    }

    prevTrack() {
        this.loadTrack(this.currentTrackIndex - 1);
    }

    nextTrack() {
        this.loadTrack(this.currentTrackIndex + 1);
    }

    animateVisualizer() {
        // Simple fake visualizer animation
        if (this.isPlaying && this.domVisualizer) {
            const bars = this.domVisualizer.children;
            for (let i = 0; i < bars.length; i++) {
                const height = 5 + Math.random() * 20;
                bars[i].style.height = height + "px";
            }
        }
        requestAnimationFrame(() => this.animateVisualizer());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();

    // Listen for messages from parent to pause music
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'MUSIC_STARTED' && event.data.source === 'desktop') {
            // Pause car game music when desktop music starts
            if (window.musicPlayer) {
                window.musicPlayer.pauseMusic();
            }
        }
    });
});
