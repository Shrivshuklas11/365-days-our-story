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
    const month = $("#month-01");
    const stage = $("#photo-stage-01");
    const world = $("#photo-world-01");
    const gallery = $("#photos-01");
    const currentEl = $("#photo-current-01");
    const totalEl = $("#photo-total-01");
    const progress = $("#photo-progress-01 .photo-progress-fill");
    const previousButton = $("#previousPhoto");
    const nextButton = $("#nextPhoto");
    const audio = $("#month-01-audio");
    const voice = $("#voice-button-01");
    const sound = $("#globalSoundToggle");

    const transitionSystem = $("#transitionSystem");
    const transitionBack = $("#transitionBack");
    const transitionMain = $("#transitionMain");
    const transitionFront = $("#transitionFront");
    const transitionParticles = $("#transitionParticles");
    /* =====================================================
   PHOTO MOTION WRAPPER
   Movement is separated from photo transitions
===================================================== */

function wrapPhotosForMotion() {
    if (!gallery) return;

    $$(".story-photo", gallery).forEach(photo => {
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

const photos = $$(".story-photo", gallery);     

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

    const PHOTO_DURATION = 5500;
    const TRANSITION_DURATION = 1850;

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
        `${m.d}s`
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
            newIndex %
            TRANSITIONS.length
        ];

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

/* START MOVEMENT + TIMER IMMEDIATELY */
applyMovement(
    newPhoto,
    newIndex
);

startTimer();

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

            photo.style.opacity = "0";
            photo.style.visibility = "hidden";
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

    newPhoto.style.opacity = "1";
    newPhoto.style.visibility = "visible";

    neighbourClasses();

    layerReset();

    state.transitioning = false;

    updateCounter();

}, TRANSITION_DURATION);

}

    /* =====================================================
       NEXT / PREVIOUS
       ===================================================== */

    function next() {

        if (
            !state.started ||
            state.transitioning ||
            photos.length < 2
        ) {
            return;
        }

        stopTimer();

        const old =
            state.index;

        state.index =
            (state.index + 1) %
            photos.length;

        runTransition(
            old,
            state.index,
            1
        );

    }

    function previous() {

        if (
            !state.started ||
            state.transitioning ||
            photos.length < 2
        ) {
            return;
        }

        stopTimer();

        const old =
            state.index;

        state.index =
            (
                state.index -
                1 +
                photos.length
            ) %
            photos.length;

        runTransition(
            old,
            state.index,
            -1
        );

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
        /* =========================================================
   INTERACTIVE STRANDS — MONTH 01
   ========================================================= */

function initInteractiveStrands(canvas, stage) {

    if (!canvas || !stage) return;

    const ctx = canvas.getContext("2d");

    const strands = [];

    const CONFIG = {
        count: 65,
        points: 18,
        segment: 15,

        gravity: 0.22,
        friction: 0.985,

        mouseRadius: 135,
        mouseForce: 9,

        iterations: 4
    };

    const mouse = {
        x: -9999,
        y: -9999
    };

    function resize() {

        const rect = stage.getBoundingClientRect();

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }

    function updateMouse(clientX, clientY) {

        const rect =
            canvas.getBoundingClientRect();

        mouse.x =
            clientX - rect.left;

        mouse.y =
            clientY - rect.top;
    }

    stage.addEventListener(
        "pointermove",
        event => {
            updateMouse(
                event.clientX,
                event.clientY
            );
        },
        { passive: true }
    );

    stage.addEventListener(
        "pointerleave",
        () => {
            mouse.x = -9999;
            mouse.y = -9999;
        },
        { passive: true }
    );

    stage.addEventListener(
        "touchmove",
        event => {

            const touch =
                event.touches[0];

            if (!touch) return;

            updateMouse(
                touch.clientX,
                touch.clientY
            );
        },
        { passive: true }
    );

    class Point {

        constructor(x, y, pinned = false) {

            this.x = x;
            this.y = y;

            this.oldX = x;
            this.oldY = y;

            this.pinned = pinned;
        }

        update() {

            if (this.pinned) return;

            const vx =
                (this.x - this.oldX)
                * CONFIG.friction;

            const vy =
                (this.y - this.oldY)
                * CONFIG.friction;

            this.oldX = this.x;
            this.oldY = this.y;

            this.x += vx;
            this.y += vy;

            this.y += CONFIG.gravity;

            const dx =
                mouse.x - this.x;

            const dy =
                mouse.y - this.y;

            const dist =
                Math.hypot(dx, dy);

            if (
                dist > 0 &&
                dist < CONFIG.mouseRadius
            ) {

                const force =
                    (1 - dist / CONFIG.mouseRadius)
                    * CONFIG.mouseForce;

                this.x -=
                    (dx / dist) * force;

                this.y -=
                    (dy / dist) * force;
            }
        }
    }

    class Strand {

        constructor(x) {

            this.points = [];

            for (
                let i = 0;
                i < CONFIG.points;
                i++
            ) {

                this.points.push(
                    new Point(
                        x,
                        -20 + i * CONFIG.segment,
                        i === 0
                    )
                );
            }

            this.phase =
                Math.random() * Math.PI * 2;

            this.alpha =
                .28 + Math.random() * .42;
        }

        constrain() {

            for (
                let i = 0;
                i < this.points.length - 1;
                i++
            ) {

                const a =
                    this.points[i];

                const b =
                    this.points[i + 1];

                const dx =
                    b.x - a.x;

                const dy =
                    b.y - a.y;

                const distance =
                    Math.hypot(dx, dy) || 0.001;

                const difference =
                    (
                        distance -
                        CONFIG.segment
                    ) / distance;

                const offsetX =
                    dx * difference * .5;

                const offsetY =
                    dy * difference * .5;

                if (!a.pinned) {

                    a.x += offsetX;
                    a.y += offsetY;
                }

                if (!b.pinned) {

                    b.x -= offsetX;
                    b.y -= offsetY;
                }
            }
        }

        update(time) {

            const sway =
                Math.sin(
                    time * .0007 +
                    this.phase
                ) * .12;

            for (
                let i = 0;
                i < this.points.length;
                i++
            ) {

                const p =
                    this.points[i];

                p.update();

                if (!p.pinned) {

                    p.x +=
                        sway *
                        (i / this.points.length);
                }
            }

            for (
                let i = 0;
                i < CONFIG.iterations;
                i++
            ) {

                this.constrain();
            }
        }

        draw() {

            if (this.points.length < 2)
                return;

            ctx.beginPath();

            ctx.moveTo(
                this.points[0].x,
                this.points[0].y
            );

            for (
                let i = 1;
                i < this.points.length;
                i++
            ) {

                const p =
                    this.points[i];

                ctx.lineTo(
                    p.x,
                    p.y
                );
            }

            ctx.strokeStyle =
                `rgba(220,220,235,${this.alpha})`;

            ctx.lineWidth = 1;

            ctx.stroke();

            const tip =
                this.points[
                    this.points.length - 1
                ];

            ctx.beginPath();

            ctx.arc(
                tip.x,
                tip.y,
                2.2,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(255,220,150,.9)";

            ctx.fill();
        }
    }

    function createStrands() {

        strands.length = 0;

        const rect =
            stage.getBoundingClientRect();

        for (
            let i = 0;
            i < CONFIG.count;
            i++
        ) {

            const x =
                25 +
                Math.random() *
                Math.max(
                    1,
                    rect.width - 50
                );

            strands.push(
                new Strand(x)
            );
        }
    }

    function animate(time) {

        const rect =
            stage.getBoundingClientRect();

        ctx.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );

        for (const strand of strands) {

            strand.update(time);
            strand.draw();
        }

        requestAnimationFrame(
            animate
        );
    }

    resize();
    createStrands();

    window.addEventListener(
        "resize",
        resize
    );

    requestAnimationFrame(
        animate
    );
}


/* START MONTH 01 INTERACTIVE BACKGROUND */

initInteractiveStrands(
    document.getElementById(
        "interactive-strands-01"
    ),
    stage
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
       ENTER MONTH
       ===================================================== */

    function enterMonth() {

        if (!month) {
            return;
        }

        chapter?.classList.remove(
            "chapter-active"
        );

        month.classList.add(
            "month-active"
        );

        month.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "month-one-active"
        );

        showInitialPhoto();

        startMusic();

        startTimer();
    }

    /* =====================================================
       BEGIN STORY
       ===================================================== */

    async function begin() {

        if (state.started) {
            return;
        }

        state.started = true;

        start.disabled = true;

        document.body.classList.add(
            "story-started"
        );

        /*
         * Try audio inside the user's click.
         */

        if (
            audio &&
            !state.audioMuted
        ) {

            audio.volume = 0;

            audio.play()
                .then(() => {

                    state.audioStarted =
                        true;

                    state.audioPlaying =
                        true;

                })
                .catch(() => {});
        }

        if (intro) {

            intro.classList.add(
                "intro-leaving"
            );
        }

        await wait(850);

        intro?.classList.add(
            "intro-hidden"
        );

        story?.classList.add(
            "story-visible"
        );

        story?.setAttribute(
            "aria-hidden",
            "false"
        );

        header?.classList.add(
            "header-visible"
        );

        await wait(180);

        chapter?.classList.add(
            "chapter-active"
        );

        await wait(3000);

        enterMonth();
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

    previousButton?.addEventListener(
        "click",
        previous
    );

    nextButton?.addEventListener(
        "click",
        next
    );

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

    showInitialPhoto();

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
