 
let localStream = null;

const myself_vidtag = document.getElementById("myself_vidtag");
const vid_button = document.getElementById("vid_button");
const mic_button = document.getElementById("mic_button");

let mic_status = true; // true if open else close
let vid_status = true; // true if open else close

// Get initial stream (both audio + video)
async function initStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myself_vidtag.srcObject = localStream;
    } catch (err) {
        console.error("Error accessing media devices:", err);
    }
}
initStream();

// Toggle camera
vid_button.addEventListener("click", () => {
    vid_status = !vid_status;
    vid_button.style.background = vid_status ? "#04497B" : "#9f3a3a";

    if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = vid_status; // enable/disable instead of stop
        });
    }
});

// Toggle microphone
mic_button.addEventListener("click", () => {
    mic_status = !mic_status;
    mic_button.style.background = mic_status ? "#04497B" : "#9f3a3a";

    if (localStream) {
        localStream.getAudioTracks().forEach(track => {
            track.enabled = mic_status; // enable/disable instead of stop
        });
    }
}); 

const start_video_call = document.getElementById("start_video_call");
start_video_call.addEventListener('click', async ()=>{
    sessionStorage.setItem("user_id", user_id);
    sessionStorage.setItem("mic_status", mic_status);
    sessionStorage.setItem("vid_status", vid_status);
    window.location.href = link_open_meeting;

})
