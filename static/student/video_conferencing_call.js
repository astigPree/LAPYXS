(async()=>{


var video_handler = new VideoHandler(
    document.getElementById(`call_video_${user_id}`),
    document.getElementById(`call_mic_${user_id}`),
    document.getElementById(`call_vid_${user_id}`),
    ws_data.ws,
    user_id,
    mic_status == 'true' ? true : false,
    video_status == 'true' ? true : false
);

ws_data.add_event("conferencing" , (event)=>{
    video_handler.webSocketOnMessage(event);
});
 

const start_call_container = document.getElementById("start_call_container");
const start_call = document.getElementById("start_now_call");
start_call.disabled = true;
start_call.addEventListener("click", () => {
    if (start_call.disabled) return; 
    start_call.disabled = true;
    video_handler.start();
    start_call_container.style.display = "none";
    group_call_container.style.display = "flex";
})

setTimeout(()=>{
    start_call.disabled = false;
    console.log("start call");
}, 1000); // 1000ms = 1s

const group_call_container = document.getElementById("group_call_container"); 

video_handler.additional_create_video = (peerUsername)=>{

    const old_video = document.getElementById(`joined-${peerUsername}`); 
    if (old_video){
        old_video.remove(); 
    }

    
    const joined_type_user = peerUsername == joined_users?.teacher_id ? "Teacher" : "Student";
    const joine_user_fullname = joined_users[peerUsername] || "Unknown";

    group_call_container.insertAdjacentHTML('beforeend',`
        <div class="video-teacher-whiteboard" id="joined-${peerUsername}">
            <h4 class="poppins-bold ellipsis">(${joined_type_user}) ${joine_user_fullname}</h4>
            <div class="video-holder">
                <p class="poppins-regular"> Waiting to join !</p>
                <video src="" id="${peerUsername}-video" autoplay playsinline ></video>
                ${
                    joined_type_user == "Teacher" ? "" : ` 
                        <button class="video-holder-mute" id="raise-hand-${peerUsername}" style="background-color: #04497B;">
                            <img src="/static/assets/raise-hand.svg" alt="">
                        </button>  
                    ` 
                }
            </div>
        </div> 
    `)

    return document.getElementById(`${peerUsername}-video`);
}


video_handler.additional_remove_video = (peerUsername)=>{
    const old_video = document.getElementById(`joined-${peerUsername}`)
    if (old_video){
        old_video.remove(); 
    }
}


const raise_hand_button = document.getElementById("raise_hand_button");
raise_hand_button.addEventListener("click", () => { 
    video_handler.raiseHand(user_id);
    if (video_handler.raise_hand_status == true){
        raise_hand_button.textContent = "Lower your hand";
    } else {
        raise_hand_button.textContent = "Raise your hand";
    }
})





})();




