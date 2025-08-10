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
    currfolder = folder; // Store the current folder globally if needed

    // Fetch the directory listing
    let a = await fetch(`http://127.0.0.1:5500/${currfolder}`);
    let response = await a.text();

    // Parse the HTML response
    let div = document.createElement("div");
    div.innerHTML = response;

    // Find all <a> tags (links to files)
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let i = 0; i < as.length; i++) {
        let href = as[i].href;
        if (href.endsWith(".mp3")) {
            // Extract just the file name
            let song = href.split("/").pop();

            // Decode %20 and other URI encodings
            song = decodeURIComponent(song);

            songs.push(song);
        }
    }
    
    //show all the song in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = "blank"
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="/icon/music.svg" alt="">
                            <div class="info">
                                <div>${song}</div>
                                <div>Movie</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="/icon/play.svg" alt="PlayNow">
                            </div>  </li>`
    }

    //Attach an event listener to every song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
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
    console.log("displayalbums() called");
    
    let a = await fetch(`http://127.0.0.1:5500/playlist/`);
    let response = await a.text();

    console.log("Fetched /playlist/");

    let div = document.createElement("div");
    div.innerHTML = response;

    let cardContainer = document.querySelector(".cardContainer");
    if (!cardContainer) {
        console.error("cardContainer not found!");
        return;
    }

    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);

    console.log("Found anchors: ", array);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if (e.href.includes("/playlist")) {
            let folder = e.href.split("/").filter(Boolean).pop();
            if (!folder || folder.toLowerCase() === "playlist") continue;

            try {
                let a = await fetch(`http://127.0.0.1:5500/playlist/${folder}/info.json`);
                let response = await a.json();
                console.log("Loaded info.json for folder:", folder, response);

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="40" height="40">
                                <circle cx="256" cy="256" r="256" fill="green" />
                                <path d="M188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9v176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z" fill="black"/>
                            </svg>
                        </div>
                        <img src="/playlist/${folder}/cover.jpg">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`;
            } catch (error) {
                console.error(`Error fetching info.json for folder ${folder}:`, error);
            }
        }
    }

    // Attach event listeners
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Card clicked:", item.currentTarget.dataset.folder);
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
