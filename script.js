/* --- CONFIGURATION --- */
const loveQuotes = [
    "Question",
    "Question",
    "Question",
    "Question",
    "Question"
];


const memoryIcons = ['🌹', '🍫', '🧸', '💍', '🍕', '🐱']; 


const quizData = [
    { question: "What do I like more about you?", answers: ["Eyes", "Your Mommy", "Boobies"], correct: 2, wrongMsg: "WROOOOONG" },
    { question: "Where was I born?", answers: ["Moon", "Nowhere", "Somewhere"], correct: 1, wrongMsg: "OFC!" },
    { question: "Who is better?", answers: ["I am", "You", "Both"], correct: 0, wrongMsg: "NA THATS BAD!" }
];


const finalLetterText = "Your the love of my life!";

/* --- STATE MANAGEMENT --- */
let collectedHearts = 0;
let currentQuestionIndex = 0;
let hasStartedMusic = false;
let easterEggCount = 0;

/* --- AUDIO ENGINE (Synthesizer for SFX) --- */
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    
    if (type === 'collect') { // High Ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'correct') { // Success Chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1); // C#
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'wrong') { // Low Buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}

function startMusic() {
    const music = document.getElementById('bg-music');
    music.volume = 0.4;
    music.play().catch(e => console.log("Autoplay prevented"));
    hasStartedMusic = true;
}

/* --- SCENE MANAGEMENT --- */
const scenes = {
    loading: document.getElementById('scene-loading'),
    level1: document.getElementById('scene-level1'),
    memory: document.getElementById('scene-memory'),
    level2: document.getElementById('scene-level2'),
    end: document.getElementById('scene-end')
};

function switchScene(sceneName) {
    Object.values(scenes).forEach(el => el.classList.remove('active'));
    scenes[sceneName].classList.add('active');
}

/* --- PARTICLE SYSTEM (GAME JUICE) --- */
function createParticles(x, y, type = 'gold') {
    const colors = type === 'love' ? ['#ff4d6d', '#ff758f', '#fff'] : ['#ffeb3b', '#ffd700', '#fff'];
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        document.body.appendChild(particle);

        const destX = (Math.random() - 0.5) * 150;
        const destY = (Math.random() - 0.5) * 150;

        particle.animate([
            { transform: `translate(0,0) scale(1)`, opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            fill: 'forwards'
        }).onfinish = () => particle.remove();
    }
}

/* --- LOADING SCREEN & EASTER EGG --- */
window.onload = () => {
    let width = 0;
    const loadingBar = document.getElementById('loading-bar');
    const startBtn = document.getElementById('start-btn');
    const loadingText = document.getElementById('loading-text');

    // Easter Egg Listener
    document.getElementById('title-trigger').addEventListener('click', (e) => {
        easterEggCount++;
        if (easterEggCount === 5) {
            createParticles(e.clientX, e.clientY, 'love');
            loadingText.innerText = "❤️ CHEAT CODE ACTIVATED ❤️";
            playSound('correct');
        }
    });

    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            loadingText.innerText = "Ready? Press to start!";
            startBtn.classList.remove('hidden');
        } else {
            width++;
            loadingBar.style.width = width + '%';
        }
    }, 40);

    startBtn.addEventListener('click', (e) => {
        startMusic();
        createParticles(e.clientX, e.clientY);
        switchScene('level1');
        startLevel1();
    });
};

/* --- LEVEL 1: MOVING HEARTS --- */
function startLevel1() {
    const container = document.getElementById('hearts-container');
    container.innerHTML = '';
    collectedHearts = 0;
    document.getElementById('heart-count').innerText = 0;

    loveQuotes.forEach((quote) => {
        const heart = document.createElement('div');
        heart.classList.add('heart-item');
        heart.innerHTML = '❤️';
        
        
        setRandomPos(heart);
        
       
        moveHeartRandomly(heart);

        heart.addEventListener('click', (e) => {
            playSound('collect');
            createParticles(e.clientX, e.clientY, 'love');
            collectHeart(heart, quote);
        });

        container.appendChild(heart);
    });
}

function setRandomPos(el) {
    el.style.left = Math.random() * (window.innerWidth - 80) + 'px';
    el.style.top = Math.random() * (window.innerHeight - 150) + 80 + 'px';
}

function moveHeartRandomly(el) {
    
    const duration = 2000 + Math.random() * 2000;
    
    el.animate([
        { transform: `translate(0,0)` },
        { transform: `translate(${(Math.random()-0.5)*100}px, ${(Math.random()-0.5)*100}px)` }
    ], {
        duration: duration,
        direction: 'alternate',
        iterations: Infinity,
        easing: 'ease-in-out'
    });
}

function collectHeart(element, quote) {
    element.style.pointerEvents = 'none'; 
    element.animate([
        { transform: 'scale(1.5) rotate(0deg)', opacity: 1 },
        { transform: 'scale(0) rotate(360deg)', opacity: 0 }
    ], { duration: 500 }).onfinish = () => element.remove();

    collectedHearts++;
    document.getElementById('heart-count').innerText = collectedHearts;
    showPopup(quote);

    if (collectedHearts === loveQuotes.length) {
        setTimeout(() => {
            switchScene('memory');
            startMemoryGame();
        }, 1500);
    }
}

function showPopup(text) {
    const popup = document.getElementById('msg-popup');
    document.getElementById('popup-text').innerText = text;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 2000);
}

/* --- LEVEL 1.5: MEMORY --- */
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let memoryMatches = 0;

function startMemoryGame() {
    const grid = document.getElementById('memory-board');
    grid.innerHTML = '';
    memoryMatches = 0;
    
    
    const selection = memoryIcons.slice(0, 3); 
    const cards = [...selection, ...selection];
    cards.sort(() => 0.5 - Math.random());

    cards.forEach(icon => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="front-face">${icon}</div>
            <div class="back-face">?</div>
        `;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');
    playSound('collect');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    playSound('correct');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
    memoryMatches++;
    
   
    if(memoryMatches === 3) {
        setTimeout(() => {
            switchScene('level2');
            startLevel2();
        }, 1000);
    }
}

function unflipCards() {
    lockBoard = true;
    playSound('wrong');
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

/* --- LEVEL 2: QUIZ --- */
function startLevel2() {
    currentQuestionIndex = 0;
    loadQuestion();
}

function loadQuestion() {
    const qData = quizData[currentQuestionIndex];
    document.getElementById('question-text').innerText = qData.question;
    const answersBox = document.getElementById('answers-box');
    answersBox.innerHTML = '';

    qData.answers.forEach((ans, index) => {
        const btn = document.createElement('button');
        btn.classList.add('answer-btn');
        btn.innerText = ans;
        btn.onclick = (e) => checkAnswer(index, btn, e);
        answersBox.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btnElement, e) {
    const qData = quizData[currentQuestionIndex];
    const feedback = document.getElementById('feedback-text');

    if (selectedIndex === qData.correct) {
        playSound('correct');
        createParticles(e.clientX, e.clientY);
        btnElement.style.background = "rgba(0, 255, 0, 0.5)";
        feedback.innerText = "Correct! ❤️";
        
        setTimeout(() => {
            currentQuestionIndex++;
            feedback.innerText = "";
            if (currentQuestionIndex < quizData.length) {
                loadQuestion();
            } else {
                switchScene('end');
                startTypewriter();
            }
        }, 1000);
    } else {
        playSound('wrong');
        btnElement.classList.add('shake');
        feedback.innerText = qData.wrongMsg;
        setTimeout(() => btnElement.classList.remove('shake'), 500);
    }
}

/* --- END SCREEN: TYPEWRITER --- */
function startTypewriter() {
    const el = document.getElementById('final-letter');
    const replayBtn = document.getElementById('replay-btn');
    let i = 0;
    el.innerHTML = "";
    
    function type() {
        if (i < finalLetterText.length) {
            el.innerHTML += finalLetterText.charAt(i);
            i++;
            setTimeout(type, 50);
        } else {
            replayBtn.classList.remove('hidden');
        }
    }
    type();
}

document.getElementById('replay-btn').addEventListener('click', () => location.reload());