console.log("Let's start writting JavaScript")
let currentsong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedMins = mins < 10 ? '0' + mins : mins;
    const paddedSecs = secs < 10 ? '0' + secs : secs;
    return `${paddedMins}:${paddedSecs}`;
}


async function getsongs(folder) {
    currfolder = folder;

    let res = await fetch(`/${folder}/info.json`);
    let data = await res.json();

    songs = data.songs;

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="/icon/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Song</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="/icon/play.svg">
            </div>
        </li>`;
    }

    // click event
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText.trim());
        });
    });

    return songs;
}

// Auto-play next song when current song ends
currentsong.addEventListener("ended", () => {
    let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
    let index = songs.indexOf(currentFileName);
    
    if (index !== -1 && index < songs.length - 1) {
        playMusic(songs[index + 1]);
    } else {
        console.log("Playlist ended.");
    }
});


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/playlist/" + track)
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "/icon/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayalbums() {
    let folders = [
        "STK",
        "ABCD",
        "Air Lift",
        "Genius",
        "new_song",
        "Rustom",
        "90_songs",
        "2state"
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
                    <p>${response.description}</p>
                </div>`;
        } catch (error) {
            console.log("Error loading:", folder);
        }
    }

    // click event
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`playlist/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}


async function main() {
    //Get the list of all the songs 
    await getsongs("playlist/STK")
    playMusic(songs[0], true)

    //Display all the albumbs on the page
    displayalbums()

    //Atttach an event linstener to play , next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "/icon/pause.svg";
        } else {
            currentsong.pause();
            play.src = "/icon/play.svg";
        }
    });

    //Listen for time apdate event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    });

    //Add an event listener to seek bar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = ((e.offsetX / e.target.getBoundingClientRect().width) * 100)
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    });

    //Add an event listenenr for close button
    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    });


    //Add an event listener to previous and next button
    previous.addEventListener("click", () => {
        console.log("Previous is clicked");

        // Get the current song filename and decode it
        let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());

        // Get correct index from songs array
        let index = songs.indexOf(currentFileName);

        // Play previous song if available
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("No previous song available.");
        }
    });

    next.addEventListener("click", () => {
        console.log("Next is clicked")
        let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentFileName);
        if (index < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            console.log("No previous song available.");
        }
    })

    //Add an event listener to a volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Volume is : ", e.target.value, "/100")
        currentsong.volume = parseInt(e.target.value) / 100
    })



    //Add an event listener to the mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("/icon/volume.svg")) {
            e.target.src = e.target.src.replace("/icon/volume.svg", "/icon/mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else {
            e.target.src = e.target.src.replace("/icon/mute.svg", "/icon/volume.svg")

            currentsong.volume = 0.1

            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}


main()
