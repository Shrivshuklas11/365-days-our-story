/* =========================================================
   365 DAYS — OUR STORY
   LOVE CINEMATIC ENGINE v2
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const wait = ms => new Promise(r => setTimeout(r, ms));

    const intro = $("#intro");
    const start = $("#startButton");
    const story = $("#story");
    const header = $("#siteHeader");
    const chapter = $("#chapter-01-intro");
    let month = $("#month-01");
    let stage = $("#photo-stage-01");
    let world = $("#photo-world-01");
    let gallery = $("#photos-01");
    let currentEl = $("#photo-current-01");
    let totalEl = $("#photo-total-01");
    let progress = $("#photo-progress-01 .photo-progress-fill");
    let previousButton = $("#previousPhoto");
    let nextButton = $("#nextPhoto");
    let audio = $("#month-01-audio");
    const voice = $("#voice-button-01");
    const sound = $("#globalSoundToggle");

    /* =====================================================
       MULTI-MONTH STORY CONTROLLER
       12 months • 54 cinematic transitions • 2s/photo
       ===================================================== */

    const TOTAL_MONTHS = 12;
    let currentMonthNumber = 1;
    let globalPhotoIndex = 0;
    let storyCompleted = false;
    let audioPlaylist = [];
    let audioPlaylistIndex = 0;
    let currentAudio = null;
    let graphicTimer = null;

    const conclusionScreen = $("#conclusion");
    const birthdayRevealScreen = $("#birthdayReveal");
    const storyNavigation = $("#storyNavigation");

    const monthAudioCandidates = monthNumber => {
        const n = String(monthNumber).padStart(2, "0");
        const list = [];
        /* Main track first. Extra tracks continue automatically. */
        ["mpeg", "mp3"].forEach(ext => list.push(`month-${n}.${ext}`));
        for (let i = 2; i <= 20; i++) {
            ["mp3", "mpeg"].forEach(ext => list.push(`month-${n}-${String(i).padStart(2,"0")}.${ext}`));
        }
        return list;
    };


    const transitionSystem = $("#transitionSystem");
    const transitionBack = $("#transitionBack");
    const transitionMain = $("#transitionMain");
    const transitionFront = $("#transitionFront");
    const transitionParticles = $("#transitionParticles");
    /* =====================================================
   PHOTO MOTION WRAPPER
   Movement is separated from photo transitions
===================================================== */

function wrapPhotosForMotion(targetGallery = gallery) {
    if (!targetGallery) return;

    $$(".story-photo", targetGallery).forEach(photo => {
        if (
            photo.parentElement?.classList.contains("photo-motion")
        ) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "photo-motion";

        photo.parentNode.insertBefore(wrapper, photo);
        wrapper.appendChild(photo);
    });
}

wrapPhotosForMotion();

let photos = $$(".story-photo", gallery);     

    /* =====================================================
       54 UNIQUE TRANSITIONS
       ===================================================== */

    const TRANSITIONS = [
        "petal-reveal",
        "star-burst",
        "moon-rise",
        "water-ripple",
        "soft-light",
        "rose-bloom",
        "sparkle-burst",
        "heart-glow",
        "dream-fade",
        "golden-dust",

        "pink-mist",
        "silk-wave",
        "candle-glow",
        "night-sky",
        "floating-petals",
        "lens-flare",
        "magic-particles",
        "romantic-zoom",
        "light-sweep",
        "flower-shower",

        "stardust",
        "rose-particles",
        "dream-cloud",
        "moonlight",
        "crystal-spark",
        "heart-particles",
        "violet-dream",
        "sunset-glow",
        "fairy-dust",
        "pink-rain",

        "golden-spark",
        "nebula",
        "soft-bloom",
        "rose-light",
        "falling-stars",
        "glowing-ribbons",
        "magic-wave",
        "cherry-blossom",
        "cosmic-heart",
        "mist-reveal",

        "light-particles",
        "dreamy-float",
        "sparkle-wave",
        "romantic-flare",
        "petal-tunnel",
        "starlight-sweep",
        "rose-galaxy",
        "moon-particles",
        "fairy-lights",
        "heart-burst",

        "pink-galaxy",
        "golden-ripple",
        "flower-explosion",
        "final-dream"
    ];

    /* =====================================================
       12 CINEMATIC ENVIRONMENTS
       ===================================================== */

    const THEMES = [
        "garden-dawn",
        "rose-garden",
        "moon-garden",
        "lantern-evening",
        "lavender-dusk",
        "starlit-garden",
        "fairy-night",
        "golden-hour",
        "cherry-night",
        "misty-garden",
        "violet-moon",
        "cosmic-night"
    ];

    const state = {
        started: false,
        index: 0,
        transitioning: false,
        timer: null,
        transitionTimer: null,
        audioPlaying: false,
        audioStarted: false,
        audioMuted: false,
        touchX: 0,
        touchY: 0
    };

    const PHOTO_DURATION = 2000;
    const TRANSITION_DURATION = 1300;

    /* =====================================================
       THEME
       ===================================================== */

    function setTheme(index) {
        const theme =
            THEMES[index % THEMES.length];

        document.body.dataset.theme = theme;

        if (month) {
            month.dataset.theme = theme;
        }

        const atmosphere =
            $("#cinematicAtmosphere");

        if (atmosphere) {
            atmosphere.dataset.theme = theme;
        }
    }

    /* =====================================================
       COUNTER
       ===================================================== */

    function updateCounter() {
        const total = photos.length;

        [previousButton, nextButton]
            .filter(Boolean)
            .forEach(button => {
                button.disabled = total < 2;
            });

        if (currentEl) {
            currentEl.textContent =
                String(
                    total ? state.index + 1 : 0
                ).padStart(2, "0");
        }

        if (totalEl) {
            totalEl.textContent =
                String(total).padStart(2, "0");
        }

        if (progress && total) {
            progress.style.width =
                `${((state.index + 1) / total) * 100}%`;
        }
    }

    /* =====================================================
       NEIGHBOURS
       ===================================================== */

    function neighbourClasses() {
        photos.forEach(photo => {
            photo.classList.remove(
                "previous",
                "next"
            );
        });

        if (!photos.length) {
            return;
        }

        photos[
            (state.index - 1 + photos.length) %
            photos.length
        ].classList.add("previous");

        photos[
            (state.index + 1) %
            photos.length
        ].classList.add("next");
    }

    /* =====================================================
       NATURAL PHOTO MOVEMENT
       ===================================================== */

    function movement(index) {

    const movements = [
        [-24, -12, -0.7, 1.055, 5.5],
        [18, 10, 0.5, 1.065, 5.5],
        [-12, 18, 0.4, 1.075, 5.5],
        [24, -7, -0.45, 1.06, 5.5],
        [7, -18, 0.7, 1.07, 5.5],
        [-20, 14, -0.35, 1.08, 5.5],
        [16, -15, 0.35, 1.06, 5.5],
        [-9, 10, -0.6, 1.075, 5.5]
    ][index % 8];

    return {
        x: movements[0],
        y: movements[1],
        r: movements[2],
        s: movements[3],
        d: movements[4]
    };
}

function applyMovement(photo, index) {

    if (!photo) return;

    const motion = photo.closest(".photo-motion");

    if (!motion) return;

    const m = movement(index);

    motion.style.setProperty(
        "--drift-x",
        `${m.x}px`
    );

    motion.style.setProperty(
        "--drift-y",
        `${m.y}px`
    );

    motion.style.setProperty(
        "--drift-r",
        `${m.r}deg`
    );

    motion.style.setProperty(
        "--drift-s",
        m.s
    );

    motion.style.setProperty(
        "--drift-duration",
        `${Math.min(2, m.d)}s`
    );

    motion.classList.remove(
        "photo-drifting"
    );

    void motion.offsetWidth;

    motion.classList.add(
        "photo-drifting"
    );
}

    /* =====================================================
       RESET
       ===================================================== */

    function resetPhotoClasses() {

        photos.forEach(photo => {

            const motion = photo.closest(".photo-motion");

     if (motion) {
          motion.classList.remove("photo-drifting");
          motion.style.removeProperty("--drift-x");
          motion.style.removeProperty("--drift-r");
          motion.style.removeProperty("--drift-s");
          motion.style.removeProperty("--drift-duration");
     }
    
        }); // photos.forEach
    
    } // resetPhotoClasses
    /* =====================================================
       INITIAL PHOTO
       ===================================================== */

    function showInitialPhoto() {

        resetPhotoClasses();

        if (!photos.length) {
            updateCounter();
            return;
        }

        /* Only the current photo is allowed to be visible. */
        photos.forEach(photo => {
            photo.classList.remove(
                "active",
                "photo-enter",
                "photo-exit",
                "photo-forward",
                "photo-backward"
            );

            photo.style.opacity = "0";
            photo.style.visibility = "hidden";
            photo.style.pointerEvents = "none";
            photo.style.zIndex = "1";
        });

        const initialPhoto =
            photos[state.index];

        initialPhoto.classList.add(
            "active"
        );

        initialPhoto.style.opacity = "1";
        initialPhoto.style.visibility = "visible";
        initialPhoto.style.pointerEvents = "auto";
        initialPhoto.style.zIndex = "20";

        neighbourClasses();

        setTheme(state.index);

        applyMovement(
            photos[state.index],
            state.index
        );

        updateCounter();

        restartProgress();
    }

    /* =====================================================
       TRANSITION LAYERS
       ===================================================== */

    function layerReset() {

        [
            transitionSystem,
            transitionBack,
            transitionMain,
            transitionFront,
            transitionParticles
        ]
            .filter(Boolean)
            .forEach(element => {

                element.classList.remove(
                    "transition-running",
                    "transition-finished"
                );

                element.removeAttribute(
                    "data-transition"
                );

                element.removeAttribute(
                    "data-direction"
                );
            });

        void transitionSystem?.offsetWidth;
    }

    /* =====================================================
       RUN TRANSITION
       ===================================================== */

    function runTransition(
    oldIndex,
    newIndex,
    direction
) {

    if (
        !photos.length ||
        state.transitioning
    ) {
        return;
    }

    const oldPhoto =
        photos[oldIndex];

    const newPhoto =
        photos[newIndex];

    if (!oldPhoto || !newPhoto) {
        return;
    }

    state.transitioning = true;

    const transition =
        TRANSITIONS[
            globalPhotoIndex %
            TRANSITIONS.length
        ];

    globalPhotoIndex++;

    setTheme(newIndex);

    layerReset();

    if (transitionSystem) {

        transitionSystem.dataset.transition =
            transition;

        transitionSystem.dataset.direction =
            direction > 0
                ? "forward"
                : "backward";

        transitionSystem.classList.add(
            "transition-running"
        );
    }

    [
        transitionBack,
        transitionMain,
        transitionFront,
        transitionParticles
    ]
        .filter(Boolean)
        .forEach(element => {

            element.dataset.transition =
                transition;

        });

    /* -----------------------------------------
       FORCE OLD PHOTO OUT
    ----------------------------------------- */

    oldPhoto.classList.remove(
        "active",
        "photo-enter",
        "photo-drifting",
        "photo-forward",
        "photo-backward"
    );

    oldPhoto.classList.add(
        "photo-exit"
    );

    oldPhoto.style.opacity = "0";
    oldPhoto.style.visibility = "hidden";

    oldPhoto.dataset.transition =
        transition;


    /* -----------------------------------------
       FORCE NEW PHOTO IN
    ----------------------------------------- */

    newPhoto.classList.remove(
        "active",
        "photo-exit",
        "photo-drifting",
        "photo-forward",
        "photo-backward"
    );

    newPhoto.classList.add(
        "photo-enter"
    );

    newPhoto.classList.add(
        direction > 0
            ? "photo-forward"
            : "photo-backward"
    );

    newPhoto.dataset.transition =
        transition;

    newPhoto.style.visibility =
        "visible";

    newPhoto.style.opacity =
        "1";


    /* Force browser to register the new state */

    void oldPhoto.offsetWidth;
    void newPhoto.offsetWidth;


    /* -----------------------------------------
       SHOW NEW PHOTO
    ----------------------------------------- */

    newPhoto.classList.add(
        "active"
    );
    
    triggerAtmosphere(
        transition,
        newIndex
    );

    /* Movement begins immediately and overlaps the 1.3s transition.
       This keeps the full 2.0s photo cycle smooth instead of adding
       1.3s on top of the photo duration. */
    applyMovement(
        newPhoto,
        newIndex
    );


    /* -----------------------------------------
       FINISH TRANSITION
    ----------------------------------------- */

    clearTimeout(state.transitionTimer);

    state.transitionTimer = setTimeout(() => {

        photos.forEach(photo => {

            if (photo !== newPhoto) {

                photo.classList.remove(
                    "active",
                    "photo-enter",
                    "photo-exit",
                    "photo-forward",
                    "photo-backward",
                    "photo-drifting"
                );

                photo.style.opacity =
                    "0";

                photo.style.visibility =
                    "hidden";
            }

        });


        newPhoto.classList.remove(
            "photo-enter",
            "photo-forward",
            "photo-backward",
            "photo-exit"
        );

        newPhoto.classList.add(
            "active"
        );

        newPhoto.style.opacity =
            "1";

        newPhoto.style.visibility =
            "visible";


        neighbourClasses();

        layerReset();

        state.transitioning =
            false;

        updateCounter();

        restartProgress();

        /* The timer is already running on the 2s photo clock. */

    }, TRANSITION_DURATION);
}  


    /* =====================================================
       NEXT / PREVIOUS
       ===================================================== */

    function next() {

        if (!state.started || state.transitioning || photos.length < 2) {
            return;
        }

        /* Last photo of this month -> graphic -> next month. */
        if (state.index >= photos.length - 1) {
            stopTimer();
            finishCurrentMonth();
            return;
        }

        const old = state.index;
        state.index += 1;
        runTransition(old, state.index, 1);
    }

    function previous() {

        if (!state.started || state.transitioning || photos.length < 2) {
            return;
        }

        stopTimer();
        const old = state.index;
        state.index = Math.max(0, state.index - 1);
        runTransition(old, state.index, -1);
        startTimer();
    }

    /* =====================================================
       AUTO PLAY
       ===================================================== */

    function startTimer() {

        stopTimer();

        if (photos.length < 2) {
            return;
        }

        state.timer =
            setInterval(
                next,
                PHOTO_DURATION
            );

        restartProgress();
    }

    function stopTimer() {

        if (state.timer) {
            clearInterval(
                state.timer
            );
        }

        state.timer = null;
    }

    function restartProgress() {

        if (!progress) {
            return;
        }

        progress.classList.remove(
            "progress-running"
        );

        void progress.offsetWidth;

        progress.classList.add(
            "progress-running"
        );
    }

    /* =====================================================
       ATMOSPHERE
       ===================================================== */

    function triggerAtmosphere(
        name,
        index
    ) {

        const atmosphere =
            $("#cinematicAtmosphere");

        if (!atmosphere) {
            return;
        }

        atmosphere.dataset.transition =
            name;

        atmosphere.dataset.photo =
            index;

        atmosphere.classList.remove(
            "atmosphere-transition"
        );

        void atmosphere.offsetWidth;

        atmosphere.classList.add(
            "atmosphere-transition"
        );
    }

    /* =====================================================
       PARTICLES
       ===================================================== */

    function makeParticles(
        container,
        count,
        className
    ) {

        if (
            !container ||
            container.dataset.ready === "1"
        ) {
            return;
        }

        container.dataset.ready = "1";

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const element =
                document.createElement("i");

            element.className =
                className;

            element.style.setProperty(
                "--x",
                `${Math.random() * 100}%`
            );

            element.style.setProperty(
                "--y",
                `${Math.random() * 100}%`
            );

            element.style.setProperty(
                "--delay",
                `${Math.random() * 7}s`
            );

            element.style.setProperty(
                "--speed",
                `${4 + Math.random() * 8}s`
            );

            element.style.setProperty(
                "--size",
                `${1 + Math.random() * 4}px`
            );

            element.style.setProperty(
                "--rot",
                `${Math.random() * 360}deg`
            );

            container.appendChild(
                element
            );
        }
    }

    function buildAtmosphere() {

        makeParticles(
            $("#atmosphereStars"),
            65,
            "cinematic-star"
        );

        makeParticles(
            $("#atmosphereLanterns"),
            6,
            "cinematic-lantern"
        );

        makeParticles(
            $("#atmosphereFlowers"),
            12,
            "cinematic-flower"
        );

        makeParticles(
            $("#atmospherePetals"),
            24,
            "cinematic-petal"
        );

        makeParticles(
            $("#atmosphereFireflies"),
            18,
            "cinematic-firefly"
        );

        makeParticles(
            $("#atmosphereClouds"),
            5,
            "cinematic-cloud"
        );

        makeParticles(
            $("#atmosphereRays"),
            4,
            "cinematic-ray"
        );
    }
        /* =====================================================
       AUDIO
       ===================================================== */

    function fadeAudio(
        target,
        milliseconds = 1800
    ) {

        if (!audio) {
            return;
        }

        const from =
            audio.volume;

        const startTime =
            performance.now();

        function tick(now) {

            const progressValue =
                Math.min(
                    1,
                    (
                        now -
                        startTime
                    ) /
                    milliseconds
                );

            audio.volume =
                from +
                (
                    target -
                    from
                ) *
                progressValue;

            if (
                progressValue < 1
            ) {

                requestAnimationFrame(
                    tick
                );
            }
        }

        requestAnimationFrame(
            tick
        );
    }

    function startMusic() {

        if (
            !audio ||
            state.audioMuted
        ) {
            return;
        }

        audio.volume = 0;

        const promise =
            audio.play();

        if (
            promise &&
            promise.catch
        ) {

            promise
                .then(() => {

                    state.audioStarted =
                        true;

                    state.audioPlaying =
                        true;

                    fadeAudio(
                        0.72,
                        2200
                    );

                    updateAudioUI(
                        true
                    );
                })
                .catch(() => {

                    updateAudioUI(
                        false
                    );
                });
        }
    }

    function toggleAudio() {

        if (!audio) {
            return;
        }

        if (audio.paused) {

            state.audioMuted =
                false;

            startMusic();

        } else {

            state.audioMuted =
                true;

            fadeAudio(
                0,
                350
            );

            setTimeout(
                () => audio.pause(),
                380
            );

            state.audioPlaying =
                false;

            updateAudioUI(
                false
            );
        }
    }

    function updateAudioUI(
        playing
    ) {

        [
            voice,
            sound
        ]
            .filter(Boolean)
            .forEach(button => {

                button.classList.toggle(
                    "playing",
                    playing
                );

                button.setAttribute(
                    "aria-pressed",
                    String(playing)
                );
            });

        const voiceText =
            voice?.querySelector(
                ".voice-text"
            );

        if (voiceText) {

            voiceText.textContent =
                playing
                    ? "Pause the moment"
                    : "Listen to my heart";
        }

        const soundLabel =
            sound?.querySelector(
                ".sound-label"
            );

        if (soundLabel) {

            soundLabel.textContent =
                playing
                    ? "SOUND ON"
                    : "SOUND OFF";
        }
    }

    /* =====================================================
       MULTI-MONTH HELPERS
       ===================================================== */

    function hideStoryLayers() {
        $$(".month-screen").forEach(screen => {
            screen.classList.remove("month-active", "js-visible");
            screen.classList.add("js-hidden");
            screen.setAttribute("aria-hidden", "true");
        });

        chapter?.classList.remove("chapter-active");

        if (conclusionScreen) {
            conclusionScreen.classList.remove("js-visible");
            conclusionScreen.classList.add("js-hidden");
        }

        if (birthdayRevealScreen) {
            birthdayRevealScreen.classList.remove("js-visible");
            birthdayRevealScreen.classList.add("js-hidden");
        }
    }

    async function loadMonthGallery(monthNumber) {
        const key = String(monthNumber).padStart(2, "0");
        const screen = document.getElementById(`month-${key}`);
        if (!screen) return null;

        /*
         * The original HTML contains only a visual placeholder for Months
         * 02–12. Build the real month world here so the existing HTML does
         * not have to be rewritten and the same photo engine works for all
         * twelve chapters.
         */
        let targetGallery = $(".month-photos", screen);

        if (!targetGallery) {
            screen.classList.remove("future-month", "locked");
            screen.classList.add("month-screen", "dynamic-month");
            screen.dataset.month = key;

            screen.innerHTML = `
                <div class="month-environment" aria-hidden="true">
                    <div class="environment-gradient"></div>
                    <div class="environment-horizon"></div>
                    <div class="environment-ground-glow"></div>
                </div>

                <div class="month-header">
                    <div class="month-heading">
                        <p class="month-kicker">CHAPTER ${key}</p>
                        <h2>MONTH ${key}</h2>
                    </div>
                    <div class="month-date-mark">${key} / 12</div>
                </div>

                <div class="cinematic-photo-stage" id="photo-stage-${key}">
                    <div class="photo-world" id="photo-world-${key}">
                        <div class="photo-atmosphere" aria-hidden="true">
                            <div class="photo-haze"></div>
                            <div class="photo-light"></div>
                            <div class="photo-shadow"></div>
                        </div>
                        <div class="month-photos" id="photos-${key}"></div>
                    </div>
                    <div class="photo-counter" aria-live="polite">
                        <span>01</span>
                        <span class="counter-line"></span>
                        <span>00</span>
                    </div>
                    <div class="photo-progress" id="photo-progress-${key}" aria-hidden="true">
                        <span class="photo-progress-fill"></span>
                    </div>
                    <div class="photo-navigation" aria-label="Photo navigation">
                        <button class="photo-nav-button photo-prev" type="button">←</button>
                        <button class="photo-nav-button photo-next" type="button">→</button>
                    </div>
                </div>

                <div class="month-info">
                    <p class="memory-month">MONTH ${key}</p>
                    <h3>Another chapter.</h3>
                    <p class="memory-text">Another month, another collection of little moments worth remembering.</p>
                    <button class="voice-button" type="button" aria-label="Play or pause Month ${key} music" aria-pressed="false">
                        <span class="voice-icon"><span class="voice-bar"></span><span class="voice-bar"></span><span class="voice-bar"></span><span class="voice-bar"></span></span>
                        <span class="voice-text">Listen to my heart</span>
                    </button>
                    <audio preload="auto" aria-hidden="true"></audio>
                </div>

                <div class="chapter-progress">${key} / 12</div>
            `;

            targetGallery = $(".month-photos", screen);
        }

        if (!targetGallery) return null;

        if (!targetGallery.querySelector("img")) {
            try {
                const response = await fetch(`/api/photos/${key}`, { cache: "no-store" });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                const files = Array.isArray(data.photos) ? data.photos : [];

                targetGallery.innerHTML = "";
                files.forEach((file, index) => {
                    const img = document.createElement("img");
                    img.className = "story-photo";
                    img.alt = `Memory ${index + 1} from Month ${key}`;
                    img.draggable = false;
                    img.decoding = "async";
                    img.loading = index < 3 ? "eager" : "lazy";
                    img.src = `/media/month-${key}/${encodeURIComponent(file)}`;
                    targetGallery.appendChild(img);
                });
            } catch (error) {
                console.error(`Could not load Month ${key}`, error);
            }
        }

        wrapPhotosForMotion(targetGallery);
        return screen;
    }

    function bindMonthReferences(screen) {
        month = screen;
        stage = $(".photo-stage", screen) || screen;
        world = $(".photo-world", screen) || screen;
        gallery = $(".month-photos", screen);
        currentEl = $(".photo-counter span:first-child", screen);
        totalEl = $(".photo-counter span:last-child", screen);
        progress = $(".photo-progress-fill", screen);
        previousButton = $(".photo-prev", screen);
        nextButton = $(".photo-next", screen);

        /* Use a dedicated audio element for each month so extra tracks
           can continue without touching the existing HTML structure. */
        audio = $("audio", screen);
    }

    function stopCurrentAudio() {
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (_) {}
        audio = null;
        currentAudio = null;
    }

    function playPlaylistTrack(index) {
        if (!audio || index >= audioPlaylist.length) return;

        audioPlaylistIndex = index;
        audio.src = `/audio/${encodeURIComponent(audioPlaylist[index])}`;
        audio.volume = 0.72;
        audio.load();

        const startPromise = audio.play();
        if (startPromise?.catch) {
            startPromise.catch(() => {
                /* A browser may reject after the initial user gesture. */
            });
        }
    }

    function startMonthPlaylist(monthNumber, userGesture = false) {
        stopCurrentAudio();

        const key = String(monthNumber).padStart(2, "0");
        const screen = document.getElementById(`month-${key}`);
        if (!screen) return;

        audio = $("audio", screen);
        if (!audio) {
            audio = document.createElement("audio");
            audio.preload = "auto";
            audio.setAttribute("aria-hidden", "true");
            audio.style.display = "none";
            screen.appendChild(audio);
        }

        audioPlaylist = monthAudioCandidates(monthNumber);
        audioPlaylistIndex = 0;
        currentAudio = audio;

        audio.onended = () => {
            const nextIndex = audioPlaylistIndex + 1;
            if (nextIndex < audioPlaylist.length) {
                playPlaylistTrack(nextIndex);
            }
        };

        audio.onerror = () => {
            const nextIndex = audioPlaylistIndex + 1;
            if (nextIndex < audioPlaylist.length) {
                playPlaylistTrack(nextIndex);
            }
        };

        /* First month is started from the Begin click, satisfying the
           browser's user-gesture audio requirement. */
        playPlaylistTrack(0);

        if (!userGesture) {
            audio.volume = 0.72;
        }
    }

    function ensureGraphicStyles() {
        if ($("#story-graphic-runtime-css")) return;

        const style = document.createElement("style");
        style.id = "story-graphic-runtime-css";
        style.textContent = `
            .story-graphic-runtime{
                position:fixed;inset:0;z-index:9000;display:flex;
                align-items:center;justify-content:center;overflow:hidden;
                background:radial-gradient(circle at 50% 45%,rgba(255,190,220,.20),transparent 34%),
                           linear-gradient(135deg,#070611,#17112b 52%,#07050d);
                opacity:0;visibility:hidden;pointer-events:none;
                transition:opacity .55s ease,visibility .55s ease;
            }
            .story-graphic-runtime.active{opacity:1;visibility:visible;pointer-events:auto}
            .story-graphic-runtime canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
            .story-graphic-copy{position:relative;z-index:2;text-align:center;pointer-events:none;padding:20px}
            .story-graphic-copy small{display:block;font:9px/1.4 Arial,sans-serif;letter-spacing:.34em;opacity:.62;margin-bottom:18px}
            .story-graphic-copy strong{display:block;font:400 clamp(40px,6.5vw,92px)/1.05 Georgia,serif;letter-spacing:.01em;text-shadow:0 0 35px rgba(255,190,220,.25)}
            .story-graphic-copy span{display:block;margin-top:16px;font:9px Arial,sans-serif;letter-spacing:.22em;opacity:.52}
            .birthday-runtime-3d{position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;pointer-events:none;perspective:1200px}
            .birthday-runtime-word{position:absolute;font:700 clamp(46px,9vw,150px)/.9 Georgia,serif;letter-spacing:.08em;color:#fff;text-shadow:0 0 10px rgba(255,190,225,.45),0 0 50px rgba(255,130,190,.28);opacity:0;transform-style:preserve-3d;animation:bdayWord3D 4.8s cubic-bezier(.2,.8,.2,1) both}
            .birthday-runtime-word:nth-child(1){animation-delay:.15s}
            .birthday-runtime-word:nth-child(2){animation-delay:1s}
            .birthday-runtime-word:nth-child(3){animation-delay:1.85s}
            .birthday-runtime-message{position:absolute;bottom:14%;max-width:720px;text-align:center;font:italic clamp(16px,2vw,26px)/1.5 Georgia,serif;letter-spacing:.08em;opacity:0;animation:bdayMessage3D 1.4s 2.75s ease both;text-shadow:0 0 25px rgba(255,200,225,.25)}
            .birthday-runtime-video{position:absolute;z-index:0;inset:7% 8%;width:84%;height:86%;object-fit:contain;border-radius:24px;opacity:.32;filter:saturate(.85) brightness(.72);transform:translateZ(-80px);pointer-events:none}
            @keyframes bdayWord3D{0%{opacity:0;transform:translate3d(0,90px,-500px) rotateX(42deg) rotateY(-16deg) scale(.45);filter:blur(12px)}22%{opacity:1}65%{opacity:1;transform:translate3d(0,0,40px) rotateX(0) rotateY(0) scale(1)}100%{opacity:.92;transform:translate3d(0,-55px,0) rotateX(-6deg) rotateY(5deg) scale(1.04)}}
            @keyframes bdayMessage3D{from{opacity:0;transform:translate3d(0,35px,-120px) rotateX(18deg);filter:blur(8px)}to{opacity:.9;transform:none;filter:none}}
            .story-navigation.runtime-locked{display:none!important;pointer-events:none!important}
        `;
        document.head.appendChild(style);
    }

    let graphicAnimationFrame = null;

    function showGraphic(monthNumber, done) {
        ensureGraphicStyles();

        let overlay = $("#storyGraphicRuntime");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "storyGraphicRuntime";
            overlay.className = "story-graphic-runtime";
            overlay.innerHTML = `
                <canvas></canvas>
                <div class="story-graphic-copy">
                    <small>BETWEEN THE CHAPTERS</small>
                    <strong></strong>
                    <span>move your pointer</span>
                </div>`;
            document.body.appendChild(overlay);
        }

        const titles = [
            "And then…","The story moved on.","Another little chapter.",
            "More moments followed.","Somewhere between then and now.","Still more memories.",
            "And we kept going.","One more chapter.","The little things mattered.",
            "Almost a year.","Closer to the whole story.","And then, the wish."
        ];
        $("strong", overlay).textContent = titles[monthNumber - 1] || "And then…";
        overlay.classList.add("active");

        const canvas = $("canvas", overlay);
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let w = innerWidth, h = innerHeight, t = 0;
        const pointer = { x: w/2, y: h/2, active:false };
        const resize = () => {
            w = innerWidth; h = innerHeight;
            canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
            canvas.style.width = w+"px"; canvas.style.height = h+"px";
            ctx.setTransform(dpr,0,0,dpr,0,0);
        };
        const move = e => { pointer.x=e.clientX; pointer.y=e.clientY; pointer.active=true; };
        const leave = () => { pointer.active=false; };
        resize();
        window.addEventListener("resize", resize);
        overlay.addEventListener("pointermove", move);
        overlay.addEventListener("pointerleave", leave);

        const palette = [
            ["#ffc6df","#fff0ae"],["#c7bfff","#ffd6ed"],["#9ce8ff","#ffd2a5"],
            ["#ffcae9","#bff5ff"],["#ffe2a9","#dfc0ff"],["#ffb9c0","#fff2b6"],
            ["#a9dcff","#f8bde5"],["#d9c0ff","#ffd59c"],["#b8ffd8","#ffb9dc"],
            ["#ffd4ad","#cabaff"],["#ffbad7","#b9ebff"],["#ffe9a8","#ffb9dd"]
        ][(monthNumber-1)%12];

        const draw = () => {
            ctx.clearRect(0,0,w,h);
            t += .018;
            const mode = (monthNumber-1)%6;
            ctx.lineCap = "round";

            for(let k=0;k<5;k++){
                ctx.beginPath();
                for(let x=0;x<=w;x+=12){
                    let y;
                    if(mode===0) y=h*.5+Math.sin(x*.008+t+k)*55;
                    else if(mode===1) y=h*.5+Math.sin(x*.004+t*1.5+k)*80+Math.cos(x*.012-t)*22;
                    else if(mode===2) y=h*.5+Math.sin(x*.012+t+k)*35+(x-w/2)*.12;
                    else if(mode===3) y=h*.5+Math.cos(x*.006-t+k)*60+Math.sin(x*.002+t)*45;
                    else if(mode===4) y=h*.5+Math.sin(x*.003+t+k)*95;
                    else y=h*.5+Math.sin(x*.01+t+k)*25+Math.cos(x*.003-t)*75;
                    if(pointer.active){
                        const dx=x-pointer.x, dy=y-pointer.y, d=Math.hypot(dx,dy)||1;
                        if(d<180) y += (dy/d)*(180-d)*.25;
                    }
                    x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
                }
                ctx.strokeStyle = (k%2?palette[1]:palette[0]) + "66";
                ctx.lineWidth = 1 + k*.45;
                ctx.stroke();
            }

            const count=90;
            for(let i=0;i<count;i++){
                const a=t*.5+i*.68;
                const r=Math.min(w,h)*(.12+(i%12)*.018);
                let x=w/2+Math.cos(a)*r;
                let y=h/2+Math.sin(a)*r*.65;
                if(pointer.active){
                    const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy)||1;
                    if(d<150){const force=(150-d)/150;x+=dx/d*force*45;y+=dy/d*force*45;}
                }
                ctx.beginPath();ctx.arc(x,y,1+(i%4)*.55,0,Math.PI*2);
                ctx.fillStyle=(i%2?palette[1]:palette[0])+"cc";ctx.fill();
            }
            graphicAnimationFrame=requestAnimationFrame(draw);
        };
        cancelAnimationFrame(graphicAnimationFrame);
        draw();

        clearTimeout(graphicTimer);
        graphicTimer=setTimeout(()=>{
            cancelAnimationFrame(graphicAnimationFrame);
            window.removeEventListener("resize", resize);
            overlay.removeEventListener("pointermove", move);
            overlay.removeEventListener("pointerleave", leave);
            overlay.classList.remove("active");
            setTimeout(()=>done?.(),520);
        },1900);
    }

    function buildBirthdayReveal() {
        if (!birthdayRevealScreen) return;
        ensureGraphicStyles();

        if (!$(".birthday-runtime-3d", birthdayRevealScreen)) {
            const layer=document.createElement("div");
            layer.className="birthday-runtime-3d";
            layer.style.zIndex = "1";
            layer.innerHTML=`
                <span class="birthday-runtime-word">HAPPY</span>
                <span class="birthday-runtime-word">BIRTHDAY</span>
                <span class="birthday-runtime-word">❤️</span>
                <p class="birthday-runtime-message">You are one of the most beautiful parts of my story.<br>May every year ahead bring you reasons to smile.</p>`;
            birthdayRevealScreen.appendChild(layer);
        }

        const birthdayContent = $(".birthday-content", birthdayRevealScreen);
        if (birthdayContent) {
            birthdayContent.style.position = "relative";
            birthdayContent.style.zIndex = "3";
            birthdayContent.style.pointerEvents = "none";
        }

        /* If a birthday video is present in the HTML, keep it behind the 3D text. */
        const video = $("#birthdayVideo", birthdayRevealScreen);
        if (video) {
            video.classList.add("birthday-runtime-video");
            video.muted = true;
            video.loop = true;
            video.play().catch(()=>{});
        }
    }

    function unlockNavigation() {
        if (!storyNavigation) return;
        storyNavigation.classList.remove("runtime-locked");
        storyNavigation.style.display = "block";
        $$(".chapter-nav-button", storyNavigation).forEach(button => {
            button.disabled = false;
        });
    }

    async function finishCurrentMonth() {
        if (state.transitioning) return;
        stopTimer();
        stopCurrentAudio();

        if (currentMonthNumber >= TOTAL_MONTHS) {
            finishStory();
            return;
        }

        showGraphic(currentMonthNumber, () => {
            activateMonth(currentMonthNumber + 1, false);
        });
    }

    async function activateMonth(monthNumber, firstEntry = false) {
        clearTimeout(state.transitionTimer);
        stopTimer();

        const screen = await loadMonthGallery(monthNumber);
        if (!screen) {
            if (monthNumber < TOTAL_MONTHS) return activateMonth(monthNumber + 1, false);
            finishStory();
            return;
        }

        hideStoryLayers();
        bindMonthReferences(screen);
        currentMonthNumber = monthNumber;
        state.index = 0;
        state.transitioning = false;

        screen.classList.remove("js-hidden");
        screen.classList.add("js-visible", "month-active");
        screen.setAttribute("aria-hidden", "false");
        screen.classList.add("cinematic-mode");

        document.body.classList.toggle("month-one-active", monthNumber === 1);
        document.body.dataset.storyMonth = String(monthNumber);

        photos = $$(".story-photo", gallery);
        wrapPhotosForMotion(gallery);
        photos = $$(".story-photo", gallery);

        if (!photos.length) {
            return finishCurrentMonth();
        }

        /* Fresh references are needed because the photo engine was originally
           written for Month 01 only. */
        previousButton?.replaceWith(previousButton.cloneNode(true));
        nextButton?.replaceWith(nextButton.cloneNode(true));
        previousButton = $(".photo-prev", screen);
        nextButton = $(".photo-next", screen);
        previousButton?.addEventListener("click", previous);
        nextButton?.addEventListener("click", next);

        setTheme(0);
        showInitialPhoto();

        const alreadyStartedFirstAudio =
            monthNumber === 1 &&
            firstEntry &&
            audio &&
            currentAudio === audio &&
            !audio.paused;

        if (!alreadyStartedFirstAudio) {
            startMonthPlaylist(monthNumber, firstEntry);
        }

        /* Rebind swipe/parallax to the currently active month. */
        let touchStartX = 0;
        let touchStartY = 0;
        stage?.addEventListener("touchstart", event => {
            const touch = event.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive:true });
        stage?.addEventListener("touchend", event => {
            const touch = event.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx)) return;
            dx < 0 ? next() : previous();
        }, { passive:true });
        world?.addEventListener("pointermove", event => {
            const rect = world.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - .5;
            const y = (event.clientY - rect.top) / rect.height - .5;
            const photo = photos[state.index];
            if (!photo) return;
            photo.style.setProperty("--mouse-x", `${x * 14}px`);
            photo.style.setProperty("--mouse-y", `${y * 10}px`);
        });

        startTimer();
    }

    function forceBirthdayRevealVisible() {
        if (!birthdayRevealScreen) return;

        /* Final safety layer: the birthday reveal must never remain hidden
           because of an older .birthday-reveal / .locked CSS rule. */
        birthdayRevealScreen.classList.remove("js-hidden", "locked");
        birthdayRevealScreen.classList.add("js-visible");
        birthdayRevealScreen.style.display = "grid";
        birthdayRevealScreen.style.position = "fixed";
        birthdayRevealScreen.style.inset = "0";
        birthdayRevealScreen.style.width = "100vw";
        birthdayRevealScreen.style.height = "100svh";
        birthdayRevealScreen.style.opacity = "1";
        birthdayRevealScreen.style.visibility = "visible";
        birthdayRevealScreen.style.pointerEvents = "auto";
        birthdayRevealScreen.style.zIndex = "9999";
        birthdayRevealScreen.setAttribute("aria-hidden", "false");
    }

    function finishStory() {
        stopTimer();
        stopCurrentAudio();
        state.transitioning = false;
        storyCompleted = true;
        localStorage.setItem("storyCompleted", "true");

        hideStoryLayers();

        if (conclusionScreen) {
            conclusionScreen.classList.remove("js-hidden");
            conclusionScreen.classList.add("js-visible");
            conclusionScreen.setAttribute("aria-hidden", "false");
        }

        buildBirthdayReveal();

        /* Conclusion is brief, then the actual birthday reveal opens. */
        setTimeout(() => {
            if (conclusionScreen) {
                conclusionScreen.classList.remove("js-visible");
                conclusionScreen.classList.add("js-hidden");
            }
            if (birthdayRevealScreen) {
                forceBirthdayRevealVisible();
                buildBirthdayReveal();
            }
            playWishSong();
            unlockNavigation();
        }, 1800);
    }

    function playWishSong() {
        stopCurrentAudio();
        let wish = $("#wish-song");
        if (!wish) {
            wish = document.createElement("audio");
            wish.id = "wish-song";
            wish.src = "/audio/wish%20song.mp3";
            wish.loop = true;
            wish.preload = "auto";
            wish.style.display = "none";
            document.body.appendChild(wish);
        }
        currentAudio = wish;
        audio = wish;
        wish.volume = .78;
        wish.play().catch(()=>{});
    }

    /* -----------------------------------------------------
       ENTER MONTH / BEGIN STORY
    ----------------------------------------------------- */

    function enterMonth(monthNumber = 1) {
        activateMonth(monthNumber, monthNumber === 1);
    }

    async function begin() {
        if (state.started) return;

        state.started = true;
        storyCompleted = false;
        localStorage.removeItem("storyCompleted");
        start.disabled = true;
        if (storyNavigation) storyNavigation.classList.add("runtime-locked");

        document.body.classList.add("story-started");

        /* Start Month 01 audio from the actual user click. */
        const firstScreen = document.getElementById("month-01");
        if (firstScreen) {
            bindMonthReferences(firstScreen);
            startMonthPlaylist(1, true);
            if (audio) audio.volume = 0;
        }

        if (intro) intro.classList.add("intro-leaving");
        await wait(700);
        intro?.classList.add("intro-hidden");
        story?.classList.add("story-visible");
        story?.setAttribute("aria-hidden", "false");
        header?.classList.add("header-visible");

        /* Only a short Chapter 01 reveal — never the old multi-minute pause. */
        /* Show the real Chapter 01 intro before the first photo. */
        await wait(180);
        chapter?.classList.add("chapter-active");
        await wait(3000);
        chapter?.classList.remove("chapter-active");

        await activateMonth(1, true);

        if (audio) {
            audio.volume = 0;
            fadeAudio(.72, 900);
        }
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    start?.addEventListener(
        "click",
        begin
    );

    voice?.addEventListener(
        "click",
        toggleAudio
    );

    sound?.addEventListener(
        "click",
        toggleAudio
    );

    /* Month navigation buttons are rebound by activateMonth(). */

    /* =====================================================
       NAVIGATION + BIRTHDAY CONTROLS
       ===================================================== */

    if (storyNavigation) {
        storyNavigation.classList.add("runtime-locked");
        $$(".chapter-nav-button", storyNavigation).forEach(button => {
            button.disabled = true;
        });
    }

    document.addEventListener("click", event => {
        const button = event.target.closest(".chapter-nav-button");
        if (!button || !storyCompleted) return;
        const m = Number((button.dataset.target || "").replace("month-", ""));
        if (m >= 1 && m <= 12) {
            event.preventDefault();
            activateMonth(m, false);
        }
    });

    document.getElementById("birthdayButton")?.addEventListener("click", () => {
        if (!birthdayRevealScreen) return;
        buildBirthdayReveal();
        forceBirthdayRevealVisible();
        buildBirthdayReveal();
        playWishSong();
    });

    /* =====================================================
       TOUCH
       ===================================================== */

    stage?.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.changedTouches[0];

            state.touchX =
                touch.clientX;

            state.touchY =
                touch.clientY;

        },
        {
            passive: true
        }
    );

    stage?.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];

            const deltaX =
                touch.clientX -
                state.touchX;

            const deltaY =
                touch.clientY -
                state.touchY;

            if (
                Math.abs(deltaX) < 55 ||
                Math.abs(deltaY) >
                Math.abs(deltaX)
            ) {
                return;
            }

            if (deltaX < 0) {
                next();
            } else {
                previous();
            }

        },
        {
            passive: true
        }
    );

    /* =====================================================
       KEYBOARD
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (!state.started) {
                return;
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                event.preventDefault();
                next();
            }

            if (
                event.key ===
                "ArrowLeft"
            ) {
                event.preventDefault();
                previous();
            }

            if (
                event.key ===
                " " &&
                document.activeElement?.tagName !==
                "BUTTON"
            ) {

                event.preventDefault();

                toggleAudio();
            }
        }
    );

        /* =====================================================
       PARALLAX
       ===================================================== */

    world?.addEventListener(
        "pointermove",
        event => {

            const rect =
                world.getBoundingClientRect();

            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width -
                0.5;

            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height -
                0.5;

            const photo =
                photos[state.index];

            if (!photo) {
                return;
            }

            photo.style.setProperty(
                "--mouse-x",
                `${x * 14}px`
            );

            photo.style.setProperty(
                "--mouse-y",
                `${y * 10}px`
            );
        }
    );

    /* =====================================================
       TAB VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                stopTimer();

            } else if (
                state.started &&
                month?.classList.contains(
                    "month-active"
                )
            ) {

                startTimer();
            }
        }
    );

    /* =====================================================
       INITIALIZE
       ===================================================== */

    buildAtmosphere();

    hideStoryLayers();
    if (storyNavigation) {
        storyNavigation.classList.add("runtime-locked");
        storyNavigation.style.display = "none";
    }

    /* =====================================================
       DEBUG / CONTROL API
       ===================================================== */

    window.LoveStory = {

        next,

        previous,

        playMusic:
            startMusic,

        pauseMusic: () => {

            audio?.pause();

            state.audioPlaying =
                false;

            updateAudioUI(
                false
            );
        },

        transitions:
            TRANSITIONS,

        state
    };

});
