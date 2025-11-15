

// const localVideo = document.getElementById("local");
// const remoteVideo = document.getElementById("remote"); 
// const pendingCandidates = [];
// let remoteDescriptionSet = false;


// // Role flag: true if this peer initiates the call
// let isCaller = false;

// const pc = new RTCPeerConnection(); 
// const protocol = location.protocol === "https:" ? "wss" : "ws";
// const room_name = "tests";
// const ws = new WebSocket(`${protocol}://${window.location.host}/ws/lapyxs/${room_name}/`);

// navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//     .then(stream => {
//         localVideo.srcObject = stream;
//         stream.getTracks().forEach(track => pc.addTrack(track, stream));
//     })
//     .catch(err => console.error("Media error:", err));

// pc.ontrack = event => {
//     remoteVideo.srcObject = event.streams[0];
// };

// pc.onicecandidate = event => {
//     if (event.candidate) {
//         ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
//     }
// };

// ws.onmessage = async ({ data }) => {
//   const msg = JSON.parse(data);
//   console.log("Received:", msg);

//     if (msg.type === "offer" && !isCaller) {
//         console.log("Setting remote offer");
//         if (pc.signalingState === "stable") {
//             await pc.setRemoteDescription(new RTCSessionDescription(msg));
//             remoteDescriptionSet = true;

//             // ✅ Apply any queued ICE candidates
//             for (const c of pendingCandidates) {
//                 try {
//                     await pc.addIceCandidate(c);
//                 } catch (err) {
//                     console.error("Buffered ICE candidate error:", err);
//                 }
//             }
//             pendingCandidates.length = 0;

//             const answer = await pc.createAnswer();
//             await pc.setLocalDescription(answer);
//             ws.send(JSON.stringify(answer));
//         } else {
//             console.warn("Offer received in wrong state:", pc.signalingState);
//         } 

//     } else if (msg.type === "answer" && isCaller) {
//         console.log("Setting remote answer");
//         if (pc.signalingState === "have-local-offer") {
//             await pc.setRemoteDescription(new RTCSessionDescription(msg));
//             remoteDescriptionSet = true;

//             // ✅ Apply any queued ICE candidates
//             for (const c of pendingCandidates) {
//                 try {
//                     await pc.addIceCandidate(c);
//                 } catch (err) {
//                     console.error("Buffered ICE candidate error:", err);
//                 }
//             }
//             pendingCandidates.length = 0;
//         } else {
//             console.warn("Answer received in wrong state:", pc.signalingState);
//         } 

//     } else if (msg.type === "candidate") {
//         const candidate = new RTCIceCandidate(msg.candidate);
//         if (remoteDescriptionSet) {
//             try {
//                 await pc.addIceCandidate(candidate);
//             } catch (err) {
//                 console.error("ICE candidate error:", err);
//             }
//         } else {
//             console.log("Queuing ICE candidate");
//             pendingCandidates.push(candidate);
//         }
//     }

// };

// async function startCall() {
//     isCaller = true;
//     console.log("Creating offer");
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     ws.send(JSON.stringify(offer));
// }
  
    

// document.getElementById("start_call").addEventListener("click", async()=>{
//     await startCall();
// })



































document.addEventListener("DOMContentLoaded", async () => {
    
const localVideo = document.getElementById("local");
const local_mic = document.getElementById("local_mic");
const local_vid = document.getElementById("local_vid");
const start_call = document.getElementById("start_call");
const username_tag = document.getElementById("username_tag");
const video_container = document.getElementById("video_container");
let ws = null;
const mapPeers = {} // 
 

function webSocketOnMessage(event){
    const peerData = JSON.parse(event.data);
    var peerUsername = peerData["peer"];
    var action = peerData["type"];
    console.log(peerData);

    if (username_tag.value == peerUsername){
        return;
        
    }
    
    const receiver_channel_name = peerData['data']['receiver_channel_name'];

    if (action == "new-peer"){
        createOffer(peerUsername, receiver_channel_name);
        return;
    }


    if (action == "new-offer"){
        var offer = peerData['data']['sdp'];
        createAnswer(offer , peerUsername , receiver_channel_name);
        return;
    }

    if (action == "new-answer"){
        var answer = peerData['data']['sdp'];
        var peer = mapPeers[peerUsername][0];

        peer.setRemoteDescription(answer);
        return;
    }

}




 

start_call.addEventListener("click", async () => {
    


    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const room_name = "tests";
    ws = new WebSocket(`${protocol}://${window.location.host}/ws/lapyxs/${room_name}/`);

    ws.addEventListener("open", async () => {
        console.log("WS Connected"); 
        sendSignal("new-peer", {})
    })

    ws.addEventListener("close", async (event) => {
        console.log("WS Closed", event);
    })

    ws.addEventListener("error", async (event) => {
        console.log("WS Error", event);
    })

    ws.addEventListener("message", async (event) => {
        webSocketOnMessage(event);
    })
    

})


var localStream = new MediaStream();

const constraint = {
    audio: true,
    video: true
}


var userMedia = navigator.mediaDevices.getUserMedia(constraint).then(stream => {
    localStream = stream;
    localVideo.srcObject = localStream; 
    localVideo.muted = true;

    var audioTrack = localStream.getAudioTracks();
    var videoTrack = localStream.getVideoTracks();

    audioTrack[0].enabled = true;
    videoTrack[0].enabled = true;

    local_mic.addEventListener("click", () => {
        audioTrack[0].enabled = !audioTrack[0].enabled; 
        local_mic.textContent = audioTrack[0].enabled ? "Mute Call" : "Unmute Call";
    });

    local_vid.addEventListener("click", () => {
        videoTrack[0].enabled = !videoTrack[0].enabled; 
        local_vid.textContent = videoTrack[0].enabled ? "Close Video" : "Open Video";
    });



}).catch(err => {
    console.error("Error accessing media devices:", err);
});


function sendSignal(action , message){
    var jsonVar = JSON.stringify({
        "peer" : username_tag.value,
        "type" : action,
        "data" : message
    });

    ws.send(jsonVar);
}




function createOffer(peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);

    var dc = peer.createDataChannel('channel');
    dc.addEventListener("open", () => {
        console.log("Data channel is open");

    })

    dc.addEventListener("message", dcOnMessage);
    
    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    mapPeers[peerUsername] = [peer, dc];

    peer.addEventListener("iceconnectionstatechange", () => {
        var iceConnectionState = peer.iceConnectionState;
        console.log("ICE State: ", iceConnectionState);
        if (iceConnectionState == "failed" || iceConnectionState == "disconnected" || iceConnectionState == "closed"){
            delete mapPeers[peerUsername];
            if (!iceConnectionState == "closed"){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    }) 

    peer.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
            console.log("ICE Candidate:", JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal(
            "new-offer",
            {
                'sdp' : peer.localDescription,
                'receiver_channel_name' : receiver_channel_name
            }
        )
    })

    peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
    }).then(() => {
        console.log("Local descriptions set successfully");
    })

}



function createAnswer(offer , peerUsername , receiver_channel_name){
    var peer = new RTCPeerConnection(null);

    addLocalTracks(peer);
  
    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener("datachannel", (event) => {
        peer.dc = event.channel;
        peer.dc.addEventListener("open", () => {
            console.log("Data channel is open"); 
        })

        peer.dc.addEventListener("message", dcOnMessage);
        
        mapPeers[peerUsername] = [peer, peer.dc];
        
    })


    peer.addEventListener("iceconnectionstatechange", () => {
        var iceConnectionState = peer.iceConnectionState;
        console.log("ICE State: ", iceConnectionState);
        if (iceConnectionState == "failed" || iceConnectionState == "disconnected" || iceConnectionState == "closed"){
            delete mapPeers[peerUsername];
            if (!iceConnectionState == "closed"){
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    }) 

    peer.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
            console.log("ICE Candidate:", JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal(
            "new-answer",
            {
                'sdp' : peer.localDescription,
                'receiver_channel_name' : receiver_channel_name
            }
        )
    }) 

    peer.setRemoteDescription(offer).then(() => {
        console.log("Remote descriptions set successfully");
        peer.createAnswer();
    }).then(answer => {
        console.log("Answer Created Successfully");
        peer.setLocalDescription(answer);
    })


}



function addLocalTracks(peer){
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });
}


function dcOnMessage(event){
    console.log(event.data);
    console.log("Message Received From Peer");
}

function createVideo(peerUsername){

    video_container.insertAdjacentHTML('beforeend',`
        <video class="video" id="${peerUsername}-video" autoplay playsinline></video>
    `); 

    return document.getElementById(`${peerUsername}-video`);
}

function setOnTrack(peer , remoteVideo){
    var remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
    peer.addEventListener("track", async(event) => {
        remoteStream.addTrack(event.track , remoteStream);
    })
}


function removeVideo(remoteVideo){
    remoteVideo.remove();
}


})















// ========================= WEBSOCKET HANDLER
// class WSStudent{ 
//     list_of_events = {}; // { name : func }
//     already_opened = false;
//     open_event = null;


//     constructor(){
//         var room_name = sessionStorage.getItem("room_name" , "1234");
//         this.is_joining = false;
//         const protocol = location.protocol === "https:" ? "wss" : "ws";
//         if (room_name){
//             this.is_joining = true;
//             this.ws = new WebSocket(`${protocol}://${window.location.host}/ws/lapyxs/${room_name}/`);
//         } else{
//             this.ws = new WebSocket(`${protocol}://${window.location.host}/ws/lapyxs/clients/`);
//         }
//         console.log(
//             `${protocol}://${window.location.host}/ws/lapyxs/${room_name}/`
//         )
//     }

//     start(){

//         this.ws.onopen = async () => {
//             console.log("WS Connected"); 
//             this.already_opened = true;
//             if (this.open_event){
//                 this.open_event();
//             }
//         };

//         this.ws.onclose = async(event) =>{
//             console.log(event)
//         }

//         this.ws.onerror = async(event)=>{
//             console.log(event);
//         }
        
//         this.ws.onmessage = async (event) => {
//             const data = JSON.parse(event.data);

//             if (data?.type === "notif"){
//                 if (this.list_of_events[data?.type]){
//                     this.list_of_events[data?.type](data);
//                 }
//             } else if (data?.type === "message"){
//                 if (this.list_of_events[data?.type]){
//                     this.list_of_events[data?.type](data);
//                 }
//             } else if (data?.type === "group_message"){
//                 if (this.list_of_events[data?.type]){
//                     this.list_of_events[data?.type](data);
//                 }
//             } else if (data?.type === "joined"){
//                 if (this.list_of_events[data?.type]){
//                     this.list_of_events[data?.type](data);
//                 }
//             } else {
//                 if (this.list_of_events["conferencing"]){
//                     this.list_of_events["conferencing"](event);
//                 }
//             }

//             // if (data.type === "offer") {
//             //     await pc.setRemoteDescription(new RTCSessionDescription(data));
//             //     const answer = await pc.createAnswer();
//             //     await pc.setLocalDescription(answer);
//             //     ws.send(JSON.stringify(pc.localDescription));
//             // } else if (data.type === "answer") {
//             //     await pc.setRemoteDescription(new RTCSessionDescription(data));
//             // } else if (data.type === "candidate") {
//             //     await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//             // }

//             // console.log("WS Received : ", data);
//         };

//     }


//     send(data){
//         if (!this.ws || this.ws.readyState !== WebSocket.OPEN){
//             console.warn("WebSocket not ready, signal dropped:", data);
//             return;
//         }
//         this.ws.send(
//             JSON.stringify(data)
//         )
//     }

//     add_already_opened_event(func){
//         if (this.already_opened){
//             func();
//         } else {
//             this.open_event = func;
//         }
        
//     }

//     add_event(name , func){
//         this.list_of_events[name] = func;
//     }
// }

// try{

//     var ws_data = new WSStudent();
//     var WS_DELAY = 0;
//     console.log("WS_DELAY : ", WS_DELAY);
//     setTimeout(()=>{
//         ws_data.start()
//     }, WS_DELAY);
    
// } catch (error){
//     console.log(error);
// }









// class VideoHandler{

//     constraint = {
//         audio: true,
//         video: true
//     }

//     mapPeers = {};
    
//     addtional_create_video = null;

//     constructor(localVideo , local_mic , local_vid , ws , username){
//         this.localStream = new MediaStream();
//         this.localVideo = localVideo;
//         this.local_mic = local_mic;
//         this.local_vid = local_vid;
//         this.ws = ws;
//         this.username = username;

//         this.userMedia = navigator.mediaDevices.getUserMedia(this.constraint).then(stream => {
//             this.localStream = stream;
//             this.localVideo.srcObject = this.localStream; 
//             this.localVideo.muted = true;

//             var audioTrack = this.localStream.getAudioTracks();
//             var videoTrack = this.localStream.getVideoTracks();

//             audioTrack[0].enabled = true;
//             videoTrack[0].enabled = true;

//             this.local_mic.addEventListener("click", () => {
//                 audioTrack[0].enabled = !audioTrack[0].enabled; 
//                 this.local_mic.textContent = audioTrack[0].enabled ? "Mute Call" : "Unmute Call";
//             });

//             this.local_vid.addEventListener("click", () => {
//                 videoTrack[0].enabled = !videoTrack[0].enabled; 
//                 this.local_vid.textContent = videoTrack[0].enabled ? "Close Video" : "Open Video";
//             });
        
//         }).catch(err => {
//             console.error("Error accessing media devices:", err);
//         });

//     }

//     sendSignal(action , message){
//         var jsonVar = JSON.stringify({
//             "peer" : this.username,
//             "type" : action,
//             "data" : message
//         });

//         this.ws.send(jsonVar);
//     }

//     start(){
//         this.sendSignal("new-peer", {})
//         console.log("Started");
//     }

//     webSocketOnMessage(event){
//         const peerData = JSON.parse(event.data);
//         var peerUsername = peerData["peer"];
//         var action = peerData["type"];
//         console.log(peerData);

//         if (this.username == peerUsername){
//             return; 
//         }
        
//         const receiver_channel_name = peerData['data']['receiver_channel_name'];

//         if (action == "new-peer"){
//             this.createOffer(peerUsername, receiver_channel_name);
//             return;
//         }


//         if (action == "new-offer"){
//             var offer = peerData['data']['sdp'];
//             this.createAnswer(offer , peerUsername , receiver_channel_name);
//             return;
//         }

//         if (action == "new-answer"){
//             var answer = peerData['data']['sdp'];
//             var peer = this.mapPeers[peerUsername][0];

//             peer.setRemoteDescription(answer);
//             return;
//         }

//     }

//     createOffer(peerUsername, receiver_channel_name){
//         var peer = new RTCPeerConnection(null);

//         this.addLocalTracks(peer);

//         var dc = peer.createDataChannel('channel');
//         dc.addEventListener("open", () => {
//             console.log("Data channel is open");

//         })

//         dc.addEventListener("message", this.dcOnMessage);
        
//         var remoteVideo = this.createVideo(peerUsername);
//         this.setOnTrack(peer, remoteVideo);

//         this.mapPeers[peerUsername] = [peer, dc];

//         peer.addEventListener("iceconnectionstatechange", () => {
//             var iceConnectionState = peer.iceConnectionState;
//             console.log("ICE State: ", iceConnectionState);
//             if (iceConnectionState == "failed" || iceConnectionState == "disconnected" || iceConnectionState == "closed"){
//                 delete this.mapPeers[peerUsername];
//                 if (!iceConnectionState == "closed"){
//                     peer.close();
//                 }

//                 this.removeVideo(remoteVideo , peerUsername);
//             }
//         }) 

//         peer.addEventListener("icecandidate", (event) => {
//             if (event.candidate) {
//                 // console.log("ICE Candidate:", JSON.stringify(peer.localDescription));
//                 return;
//             }

//             this.sendSignal(
//                 "new-offer",
//                 {
//                     'sdp' : peer.localDescription,
//                     'receiver_channel_name' : receiver_channel_name
//                 }
//             )
//         })

//         peer.createOffer().then(offer => {
//             peer.setLocalDescription(offer);
//         }).then(() => {
//             console.log("Local descriptions set successfully");
//         })

//     }


    
//     createAnswer(offer , peerUsername , receiver_channel_name){
//         var peer = new RTCPeerConnection(null);

//         this.addLocalTracks(peer);
    
//         var remoteVideo = this.createVideo(peerUsername);
//         this.setOnTrack(peer, remoteVideo);

//         peer.addEventListener("datachannel", (event) => {
//             peer.dc = event.channel;
//             peer.dc.addEventListener("open", () => {
//                 console.log("Data channel is open"); 
//             })

//             peer.dc.addEventListener("message", this.dcOnMessage);
            
//             this.mapPeers[peerUsername] = [peer, peer.dc];
            
//         })


//         peer.addEventListener("iceconnectionstatechange", () => {
//             var iceConnectionState = peer.iceConnectionState;
//             console.log("ICE State: ", iceConnectionState);
//             if (iceConnectionState == "failed" || iceConnectionState == "disconnected" || iceConnectionState == "closed"){
//                 delete this.mapPeers[peerUsername];
//                 if (!iceConnectionState == "closed"){
//                     peer.close();
//                 }

//                 this.removeVideo(remoteVideo , peerUsername);
//             }
//         }) 

//         peer.addEventListener("icecandidate", (event) => {
//             if (event.candidate) {
//                 console.log("ICE Candidate:", JSON.stringify(peer.localDescription));
//                 return;
//             }

//             this.sendSignal(
//                 "new-answer",
//                 {
//                     'sdp' : peer.localDescription,
//                     'receiver_channel_name' : receiver_channel_name
//                 }
//             )
//         }) 

//         peer.setRemoteDescription(offer).then(() => {
//             console.log("Remote descriptions set successfully");
//             peer.createAnswer();
//         }).then(answer => {
//             console.log("Answer Created Successfully");
//             peer.setLocalDescription(answer);
//         })


//     }


//     addLocalTracks(peer){
//         this.localStream.getTracks().forEach(track => {
//             peer.addTrack(track, this.localStream);
//         });
//     }


//     createVideo(peerUsername){

        

//         const video_container = document.getElementById("video_container");
//         video_container.insertAdjacentHTML('beforeend',`
//             <video class="video" id="${peerUsername}-video" autoplay playsinline></video>
//         `); 

//         return document.getElementById(`${peerUsername}-video`);
//     }

//     createVideoAddition(){

//     }

//     removeVideo(remoteVideo , peerUsername){
//         remoteVideo.remove();
//     }

//     setOnTrack(peer , remoteVideo){
//         var remoteStream = new MediaStream();
//         remoteVideo.srcObject = remoteStream;
//         peer.addEventListener("track", async(event) => {
//             remoteStream.addTrack(event.track , remoteStream);
//         })
//     }

//     dcOnMessage(event){
//         console.log(event.data);
//         console.log("Message Received From Peer");
//     }




// }


// var video_handler = new VideoHandler(
//     document.getElementById("local"),
//     document.getElementById("local_mic"),
//     document.getElementById("local_vid"),
//     ws_data.ws,
//     sessionStorage.getItem("user_id" , "1234")
// );


// ws_data.add_event("conferencing" , (event)=>{
//     video_handler.webSocketOnMessage(event);
// });
 
// // ws_data.add_already_opened_event(()=>{
// //     video_handler.start();
// // }) 

// const start_call = document.getElementById("start_call");
// start_call.addEventListener("click", () => {
//     video_handler.start();
// })











