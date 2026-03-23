console.log("Let's start writing JavaScript");

let currentsong = new Audio();
let songs = [];
let currfolder = "";

// format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

// GET SONGS FROM info.json
async function getsongs(folder) {
  currfolder = folder;

  try {
    let res = await fetch(`/${folder}/info.json`);

    if (!res.ok) {
      console.error("info.json not found:", folder);
      return [];
    }

    let data = await res.json();
    songs = data.songs || [];
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }

  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
        <li>
            <img class="invert" src="/icon/music.svg">
            <div class="info">
               <div> ${song.replace(".mp3", "")}-Song</div>
            </div>
        </li>`;
  }

  //  CLICK EVENT
  Array.from(document.querySelectorAll(".songlist li")).forEach((e, index) => {
  e.addEventListener("click", () => {
    playMusic(songs[index]);
  });
});

  return songs;
}

//  PLAY MUSIC
const playMusic = (track, pause = false) => {
  if (!track) return;

  currentsong.src = `/${currfolder}/` + track;

  if (!pause) {
    currentsong.play();
    play.src = "/icon/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(
    ".mp3",
    "",
  );
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

//  AUTO NEXT
currentsong.addEventListener("ended", () => {
  let current = decodeURIComponent(currentsong.src.split("/").pop());
  let index = songs.indexOf(current);

  if (index !== -1 && index < songs.length - 1) {
    playMusic(songs[index + 1]);
  }
});

//  DISPLAY ALBUMS
async function displayalbums() {
  let folders = [
    "STK",
    "ABCD",
    "Air Lift",
    "Genius",
    "new_song",
    "Rustom",
    "90_songs",
    "2state",
  ];

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (let folder of folders) {
    try {
      let res = await fetch(`/playlist/${folder}/info.json`);
      let data = await res.json();

      cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">▶</div>
                    <img src="/playlist/${folder}/cover.jpg">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
    } catch (error) {
      console.log("Error loading:", folder);
    }
  }

  // CLICK EVENT
  document.querySelectorAll(".card").forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.dataset.folder;
      let loadedSongs = await getsongs(`playlist/${folder}`);

      if (loadedSongs.length > 0) {
        playMusic(loadedSongs[0]);
      }
    });
  });
}

//  MAIN FUNCTION
async function main() {
  let loadedSongs = await getsongs("playlist/STK");

  if (loadedSongs.length > 0) {
    playMusic(loadedSongs[0], true);
  } else {
    console.error("No songs found!");
  }

  displayalbums();

  // PLAY / PAUSE
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "/icon/pause.svg";
    } else {
      currentsong.pause();
      play.src = "/icon/play.svg";
    }
  });

  // TIME UPDATE
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // SEEK BAR
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // SIDEBAR
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".cancel").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // PREVIOUS
  previous.addEventListener("click", () => {
    let current = decodeURIComponent(currentsong.src.split("/").pop());
    let index = songs.indexOf(current);

    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // NEXT
  next.addEventListener("click", () => {
    let current = decodeURIComponent(currentsong.src.split("/").pop());
    let index = songs.indexOf(current);

    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  // VOLUME
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = e.target.value / 100;
  });

  // MUTE
  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = "/icon/mute.svg";
      currentsong.volume = 0;
    } else {
      e.target.src = "/icon/volume.svg";
      currentsong.volume = 0.1;
    }
  });
}

// RUN
main();
