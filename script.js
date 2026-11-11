
const pages = [...document.querySelectorAll('.page')];

const nav = document.getElementById('nav');

const navButtons = [...nav.querySelectorAll('button[data-page]')];

const audio = document.getElementById('bgMusic');

const musicStatus = document.getElementById('musicStatus');

const memoryVideo = document.getElementById('memoryVideo');

const videoHelp = document.getElementById('videoHelp');


// ==================================================
// MEDIA LOADER
// ==================================================

const IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp'];

function testImage(url) {
  return new Promise(resolve => {
    const probe = new Image();

    probe.onload = () => resolve(url);
    probe.onerror = () => resolve(null);

    probe.src = url;
  });
}

async function findImage(base) {
  for (const ext of IMAGE_EXTENSIONS) {
    const found = await testImage(base + ext);

    if (found) return found;
  }

  return null;
}

async function loadImageElement(img, base, fallback) {
  if (!img || !base) return null;

  const url = await findImage(base);

  if (url) {
    img.src = url;
    img.hidden = false;

    if (fallback) fallback.hidden = true;

    return url;
  }

  img.hidden = true;

  if (fallback) fallback.hidden = false;

  return null;
}

function loadMediaSource(element, base, candidates, onReady, onFail) {
  if (!element || !base) {
    if (onFail) onFail();
    return;
  }

  let index = 0;

  const tryNext = () => {
    if (index >= candidates.length) {
      if (onFail) onFail();
      return;
    }

    const candidate = candidates[index++];
    const url = base + candidate.ext;

    const success = () => {
      cleanup();

      if (onReady) onReady(url, candidate.type);
    };

    const failure = () => {
      cleanup();
      tryNext();
    };

    const cleanup = () => {
      element.removeEventListener('canplay', success);
      element.removeEventListener('loadedmetadata', success);
      element.removeEventListener('error', failure);
    };

    element.addEventListener('canplay', success, { once: true });
    element.addEventListener('loadedmetadata', success, { once: true });
    element.addEventListener('error', failure, { once: true });

    element.src = url;

    if (element.load) element.load();
  };

  tryNext();
}


// ==================================================
// BIRTHDAY PORTRAIT AND GALLERY PHOTOS
// ==================================================

const birthdayPortrait = document.querySelector('.birthday-main-image');

if (birthdayPortrait) {
  loadImageElement(
    birthdayPortrait,
    birthdayPortrait.dataset.mediaBase,
    birthdayPortrait.parentElement.querySelector('[data-media-fallback]')
  );
}

document.querySelectorAll('.photo-card[data-photo-base]').forEach(card => {
  const img = card.querySelector('.gallery-photo');
  const fallback = card.querySelector('[data-media-fallback]');

  loadImageElement(img, card.dataset.photoBase, fallback)
    .then(url => {
      if (url) card.dataset.resolvedPhoto = url;
    });
});


// ==================================================
// VIDEO KENANGAN
// ==================================================

if (memoryVideo) {
  const posterBase = memoryVideo.dataset.posterBase;

  if (posterBase) {
    findImage(posterBase).then(url => {
      if (url) memoryVideo.poster = url;
    });
  }

  loadMediaSource(
    memoryVideo,
    memoryVideo.dataset.videoBase,
    [
      { ext: '.mp4', type: 'video/mp4' },
      { ext: '.webm', type: 'video/webm' }
    ],
    () => {
      if (videoHelp) {
        videoHelp.classList.remove('media-error');
        videoHelp.textContent = 'Video kenangan siap diputar ♡';
      }
    },
    () => {
      if (videoHelp) {
        videoHelp.classList.add('media-error');

        videoHelp.innerHTML =
          'Video belum ditemukan. Letakkan <code>memory-1.mp4</code> atau <code>memory-1.webm</code> di folder <code>assets/videos/</code>.';
      }
    }
  );
}


// ==================================================
// BACKGROUND MUSIC
// ==================================================

let musicFileReady = false;
let musicStarted = false;

// Penanda apakah musik sebelumnya sedang diputar
// sebelum video kenangan mulai dimainkan.
let resumeBackgroundAfterVideo = false;

// Penanda agar musik tidak diputar kembali jika
// pengguna mematikannya secara manual.
let musicManuallyDisabled = false;


// Memuat file musik.
loadMediaSource(
  audio,
  audio.dataset.audioBase,
  [
    { ext: '.mp3', type: 'audio/mpeg' },
    { ext: '.ogg', type: 'audio/ogg' },
    { ext: '.wav', type: 'audio/wav' }
  ],
  () => {
    musicFileReady = true;
  },
  () => {
    musicFileReady = false;

    if (musicStatus) {
      musicStatus.textContent = '♫ add song.mp3';
    }
  }
);


// Fungsi memutar musik.
async function startMusic() {
  if (!audio) return;

  // Jangan memutar musik ketika video sedang berjalan.
  if (memoryVideo && !memoryVideo.paused) {
    return;
  }

  try {
    await audio.play();

    musicStarted = true;
    musicManuallyDisabled = false;

    if (musicStatus) {
      musicStatus.textContent = '♫ now playing';
    }
  } catch (error) {
    if (musicStatus) {
      musicStatus.textContent = '♫ tap to play';
    }
  }
}


// Fungsi menghentikan musik.
function stopMusic() {
  if (!audio) return;

  audio.pause();
  musicStarted = false;

  if (musicStatus) {
    musicStatus.textContent = '♫ paused';
  }
}


// Fungsi tombol musik.
function toggleMusic() {
  if (!audio) return;

  // Jika musik sedang aktif, matikan musik.
  if (!audio.paused) {
    stopMusic();

    musicManuallyDisabled = true;
    resumeBackgroundAfterVideo = false;

    return;
  }

  // Jika video sedang diputar, jangan nyalakan musik.
  if (memoryVideo && !memoryVideo.paused) {
    musicManuallyDisabled = false;

    if (musicStatus) {
      musicStatus.textContent = '♫ paused for video';
    }

    return;
  }

  musicManuallyDisabled = false;

  startMusic();
}


// ==================================================
// AUTO PAUSE MUSIC WHEN VIDEO PLAYS
// ==================================================

if (memoryVideo && audio) {

  // Ketika video mulai diputar.
  memoryVideo.addEventListener('play', () => {

    // Cek apakah musik sedang aktif.
    resumeBackgroundAfterVideo = !audio.paused;

    // Jika musik aktif, hentikan sementara.
    if (resumeBackgroundAfterVideo) {
      audio.pause();

      if (musicStatus) {
        musicStatus.textContent = '♫ paused for video';
      }
    }

  });


  // Fungsi untuk melanjutkan musik setelah video berhenti.
  function resumeBackgroundMusic() {

    if (!resumeBackgroundAfterVideo) return;

    // Jangan lanjutkan jika pengguna mematikan musik.
    if (musicManuallyDisabled) {
      resumeBackgroundAfterVideo = false;
      return;
    }

    // Pastikan video benar-benar berhenti.
    if (!memoryVideo.paused && !memoryVideo.ended) return;

    resumeBackgroundAfterVideo = false;

    startMusic();
  }


  // Ketika video dijeda.
  memoryVideo.addEventListener('pause', resumeBackgroundMusic);

  // Ketika video selesai.
  memoryVideo.addEventListener('ended', resumeBackgroundMusic);
}


// ==================================================
// BIRTHDAY DATE AND ACCESS SETTINGS
// ==================================================

const target = new Date('2026-11-12T00:00:00+07:00');

const urlParams = new URLSearchParams(window.location.search);

// ?dev=true untuk melihat halaman birthday lock.
// ?dev=home untuk langsung melihat halaman utama.
const developerLockPreview = urlParams.get('dev') === 'true';

const developerHomePreview = urlParams.get('dev') === 'home';

const birthdayCode = '12112004';

const unlockStorageKey = 'zahraBirthdayUnlocked';

let siteUnlocked =
  developerHomePreview ||
  (
    !developerLockPreview &&
    sessionStorage.getItem(unlockStorageKey) === 'true'
  );


// ==================================================
// PAGE NAVIGATION
// ==================================================

function birthdayHasArrived() {
  return (
    developerLockPreview ||
    developerHomePreview ||
    new Date() >= target
  );
}

function showPage(id) {

  if (!birthdayHasArrived()) {
    id = 'countdownGate';
  }

  else if (!siteUnlocked && id !== 'birthdayLock') {
    id = 'birthdayLock';
  }

  else if (
    siteUnlocked &&
    (id === 'countdownGate' || id === 'birthdayLock')
  ) {
    id = 'home';
  }

  pages.forEach(page => {
    page.classList.toggle('active', page.id === id);
  });

  navButtons.forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.page === id
    );
  });

  nav.classList.remove('open');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// Navigasi menu.
navButtons.forEach(button => {
  button.addEventListener('click', () => {
    showPage(button.dataset.page);
  });
});


// Tombol halaman berikutnya.
document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => {
    showPage(button.dataset.next);
  });
});


// Logo website.
document.querySelector('.brand').addEventListener('click', event => {
  event.preventDefault();
  showPage('home');
});


// Tombol menu mobile.
document.getElementById('menuToggle').addEventListener('click', () => {
  nav.classList.toggle('open');
});


// ==================================================
// OPEN BIRTHDAY SURPRISE
// ==================================================

document.getElementById('openSurprise').addEventListener('click', () => {

  if (!siteUnlocked) return;

  document.getElementById('envelope').classList.add('open');

  musicManuallyDisabled = false;

  startMusic();

  setTimeout(() => {
    showPage('birthday');
  }, 650);

});


// Tombol musik.
document.getElementById('musicToggle').addEventListener('click', toggleMusic);


// ==================================================
// BIRTHDAY PASSWORD
// ==================================================

const codeForm = document.getElementById('birthdayCodeForm');

const codeInput = document.getElementById('birthdayCode');

const codeError = document.getElementById('codeError');

codeForm.addEventListener('submit', event => {

  event.preventDefault();

  const enteredCode = codeInput.value.replace(/\D/g, '');

  if (enteredCode === birthdayCode) {

    siteUnlocked = true;

    if (!developerLockPreview) {
      sessionStorage.setItem(unlockStorageKey, 'true');
    }

    codeError.textContent = '';
    codeInput.value = '';

    musicManuallyDisabled = false;

    startMusic();

    const lockScreen = document.querySelector('.lock-screen');

    lockScreen.classList.add('unlocking');

    setTimeout(() => {
      showPage('home');
    }, 650);

  } else {

    codeError.textContent = 'masukkan code dengan tanggal lahir kamu';

    codeInput.classList.remove('shake');

    void codeInput.offsetWidth;

    codeInput.classList.add('shake');

    codeInput.focus();

  }

});


// Membatasi input kode hanya angka.
codeInput.addEventListener('input', () => {

  codeError.textContent = '';

  codeInput.value = codeInput.value
    .replace(/\D/g, '')
    .slice(0, 8);

});


// ==================================================
// COUNTDOWN
// ==================================================

function pad(number) {
  return String(number).padStart(2, '0');
}

let gateHasOpened = false;

function revealLockScreen() {

  if (gateHasOpened || !birthdayHasArrived()) return;

  gateHasOpened = true;

  const gate = document.getElementById('countdownGate');

  gate.classList.add('leaving');

  setTimeout(() => {

    gate.classList.remove('active');

    gate.classList.remove('leaving');

    showPage(siteUnlocked ? 'home' : 'birthdayLock');

  }, 900);

}


function updateGateClock() {

  const now = new Date();

  let diff = Math.max(0, target - now);

  const days = Math.floor(diff / 86400000);

  diff %= 86400000;

  const hours = Math.floor(diff / 3600000);

  diff %= 3600000;

  const minutes = Math.floor(diff / 60000);

  diff %= 60000;

  const seconds = Math.floor(diff / 1000);

  const values = {
    gateDays: days,
    gateHours: hours,
    gateMinutes: minutes,
    gateSeconds: seconds
  };

  Object.entries(values).forEach(([id, value]) => {

    const element = document.getElementById(id);

    if (element) {
      element.textContent = pad(value);
    }

  });

  if (
    birthdayHasArrived() &&
    document.getElementById('countdownGate').classList.contains('active')
  ) {
    revealLockScreen();
  }

}


function updateBirthdayCountdown() {

  const element = document.getElementById('birthdayCountdown');

  if (!element) return;

  const diff = target - new Date();

  if (diff <= 0) {
    element.textContent = 'Today is your day! ♡';
    return;
  }

  const days = Math.floor(diff / 86400000);

  const hours = Math.floor(diff % 86400000 / 3600000);

  const mins = Math.floor(diff % 3600000 / 60000);

  element.textContent =
    `${days} days · ${hours} hours · ${mins} minutes`;

}


// ==================================================
// INITIAL PAGE
// ==================================================

if (!birthdayHasArrived()) {

  pages.forEach(page => {
    page.classList.toggle('active', page.id === 'countdownGate');
  });

} else {

  pages.forEach(page => {
    page.classList.toggle(
      'active',
      page.id === (siteUnlocked ? 'home' : 'birthdayLock')
    );
  });

}

updateGateClock();

updateBirthdayCountdown();

setInterval(() => {
  updateGateClock();
  updateBirthdayCountdown();
}, 1000);


// ==================================================
// LITTLE THINGS ABOUT YOU — MEMORY MATCHING GAME
// ==================================================

const memoryGrid = document.getElementById('memoryGrid');

if (memoryGrid) {

  const memoryPairs = [

    {
      id: 'smile',
      symbol: '☼',
      title: 'Your smile',
      message: 'Satu senyum sederhana bisa membuat suasana terasa lebih hangat. Semoga kamu selalu punya banyak alasan untuk tersenyum.',
      sign: 'keep smiling, lovely'
    },

    {
      id: 'kindness',
      symbol: '✿',
      title: 'Your kindness',
      message: 'Kebaikan yang kamu berikan, sekecil apa pun, tetap punya arti. Jangan pernah merasa bahwa ketulusanmu adalah hal biasa.',
      sign: 'your heart is lovely'
    },

    {
      id: 'dreams',
      symbol: '✧',
      title: 'Your dreams',
      message: 'Aku berharap kamu tidak pernah berhenti percaya pada mimpi-mimpimu. Pelan-pelan saja, setiap langkah kecil tetap membawamu maju.',
      sign: 'one step at a time'
    },

    {
      id: 'strength',
      symbol: '♡',
      title: 'Your strength',
      message: 'Untuk semua proses yang sedang kamu jalani: semoga kamu ingat bahwa bertahan, mencoba lagi, dan beristirahat juga bentuk kekuatan.',
      sign: "i'm proud of you"
    }

  ];


  const pairsFound = document.getElementById('pairsFound');

  const movesCount = document.getElementById('movesCount');

  const gameProgress = document.getElementById('gameProgress');

  const noteTitle = document.getElementById('noteTitle');

  const noteMessage = document.getElementById('noteMessage');

  const noteSignature = document.getElementById('noteSignature');

  const matchingNote = document.getElementById('matchingNote');

  const matchingComplete = document.getElementById('matchingComplete');

  const resetMatching = document.getElementById('resetMatching');


  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let moves = 0;
  let found = 0;


  const shuffle = items => {

    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [result[i], result[j]] = [result[j], result[i]];

    }

    return result;

  };


  function updateScore() {

    pairsFound.innerHTML = `${found} <small>/ 4</small>`;

    movesCount.textContent = moves;

    gameProgress.textContent = `${Math.round(found / 4 * 100)}%`;

  }


  function revealNote(pair) {

    noteTitle.textContent = pair.title;

    noteMessage.textContent = pair.message;

    noteSignature.textContent = pair.sign + ' ♡';

    matchingNote.classList.remove('note-pop');

    void matchingNote.offsetWidth;

    matchingNote.classList.add('note-pop');

  }


  function flipDown(card) {

    card.classList.remove('is-flipped');

    card.setAttribute('aria-pressed', 'false');

  }


  function chooseCard(card) {

    if (
      lockBoard ||
      card === firstCard ||
      card.classList.contains('is-matched') ||
      card.classList.contains('is-flipped')
    ) {
      return;
    }

    card.classList.add('is-flipped');

    card.setAttribute('aria-pressed', 'true');


    if (!firstCard) {

      firstCard = card;

      return;

    }


    secondCard = card;

    moves++;

    updateScore();


    if (firstCard.dataset.pair === secondCard.dataset.pair) {

      const pair = memoryPairs.find(item => {
        return item.id === firstCard.dataset.pair;
      });

      firstCard.classList.add('is-matched');

      secondCard.classList.add('is-matched');

      firstCard.setAttribute('aria-label', `Matched: ${pair.title}`);

      secondCard.setAttribute('aria-label', `Matched: ${pair.title}`);

      found++;

      updateScore();

      revealNote(pair);

      firstCard = null;

      secondCard = null;


      if (found === memoryPairs.length) {

        matchingComplete.hidden = false;

        matchingComplete.classList.add('complete-pop');

      }

    } else {

      lockBoard = true;

      setTimeout(() => {

        flipDown(firstCard);

        flipDown(secondCard);

        firstCard = null;

        secondCard = null;

        lockBoard = false;

      }, 850);

    }

  }


  function startMatchingGame() {

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    found = 0;

    matchingComplete.hidden = true;

    matchingComplete.classList.remove('complete-pop');

    noteTitle.textContent = 'A note is waiting for you';

    noteMessage.textContent =
      'Temukan pasangan pertamamu untuk membuka pesan kecil di sini.';

    noteSignature.textContent = 'with love, always ♡';

    memoryGrid.innerHTML = '';

    updateScore();


    const deck = shuffle(
      memoryPairs.flatMap(pair => [
        { ...pair, copy: 1 },
        { ...pair, copy: 2 }
      ])
    );


    deck.forEach((pair, index) => {

      const card = document.createElement('button');

      card.type = 'button';

      card.className = `memory-card memory-tilt-${index % 4 + 1}`;

      card.dataset.pair = pair.id;

      card.setAttribute('aria-pressed', 'false');

      card.setAttribute('aria-label', `Kartu tertutup ${index + 1}`);


      card.innerHTML = `
        <span class="memory-card-inner">
          <span class="memory-face memory-back">
            <span class="memory-card-tape"></span>
            <span class="memory-question">♡</span>
            <small>little secret</small>
          </span>

          <span class="memory-face memory-front">
            <span class="memory-card-number">
              NO. ${String(index + 1).padStart(2, '0')}
            </span>

            <span class="memory-symbol">${pair.symbol}</span>

            <span class="memory-card-caption">a little thing</span>
          </span>
        </span>
      `;


      card.addEventListener('click', () => {
        chooseCard(card);
      });

      memoryGrid.appendChild(card);

    });

  }


  resetMatching.addEventListener('click', startMatchingGame);

  startMatchingGame();

}


// ==================================================
// AUTOPLAY MUSIC AFTER FIRST USER INTERACTION
// ==================================================

document.addEventListener('pointerdown', () => {

  if (
    siteUnlocked &&
    audio.paused &&
    !musicManuallyDisabled &&
    (!memoryVideo || memoryVideo.paused)
  ) {
    startMusic();
  }

}, { once: true });


// ==================================================
// PHOTO GALLERY MODAL
// ==================================================

const modal = document.getElementById('photoModal');

const modalImg = document.getElementById('modalImage');


document.querySelectorAll('.photo-card[data-photo-base]').forEach(card => {

  card.addEventListener('click', () => {

    const src = card.dataset.resolvedPhoto;

    if (!src) {

      const fallback = card.querySelector('[data-media-fallback]');

      if (fallback) {
        fallback.classList.add('media-error');
      }

      return;

    }

    modalImg.src = src;

    modal.classList.add('show');

  });

});


document.getElementById('closeModal').addEventListener('click', () => {
  modal.classList.remove('show');
});


modal.addEventListener('click', event => {

  if (event.target === modal) {
    modal.classList.remove('show');
  }

});


// ==================================================
// BLOW THE CANDLE
// ==================================================

document.getElementById('blowCandle').addEventListener('click', () => {

  document.getElementById('flame').classList.add('out');

  document.getElementById('wishMessage').textContent =
    'Pejamkan mata, simpan harapan baikmu. ♡';


  setTimeout(() => {

    document.body.classList.add('lights-dim');

    const finale = document.getElementById('lightsOut');

    finale.classList.add('show');

    finale.setAttribute('aria-hidden', 'false');

  }, 850);

});


// ==================================================
// RETURN FROM LIGHTS OUT
// ==================================================

document.getElementById('nightReturn').addEventListener('click', () => {

  const finale = document.getElementById('lightsOut');

  finale.classList.remove('show');

  finale.setAttribute('aria-hidden', 'true');

  document.body.classList.remove('lights-dim');

});
