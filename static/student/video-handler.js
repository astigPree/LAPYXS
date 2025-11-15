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









class VideoHandler{

    constraint = {
        audio: true,
        video: true
    }

    mapPeers = {};
    
    additional_create_video = null;
    additional_remove_video = null;
    is_join = false;

    raise_hand_status = false// false = not raised , true = raised

    constructor(localVideo , local_mic , local_vid , ws , username , audio_status = true , video_status = true){
        this.localStream = new MediaStream();
        this.screenStream = null;
        this.localVideo = localVideo;
        this.local_mic = local_mic;
        this.local_vid = local_vid;
        this.ws = ws;
        this.username = username;
        this.audioTrack = null;
        this.videoTrack = null;


        this.userMedia = navigator.mediaDevices.getUserMedia(this.constraint).then(stream => {
            this.localStream = stream;
            this.localVideo.srcObject = this.localStream; 
            this.localVideo.muted = true;

            this.audioTrack = this.localStream.getAudioTracks();
            this.videoTrack = this.localStream.getVideoTracks();

            this.audioTrack[0].enabled = true;
            this.videoTrack[0].enabled = true;
            console.log("Constraint : ", this.constraint);
            console.log("Audio : ", this.audioTrack[0].enabled);
            console.log("Video : ", this.videoTrack[0].enabled);

            this.local_mic.addEventListener("click", () => {
                this.audioTrack[0].enabled = !this.audioTrack[0].enabled;  
                if (this.audioTrack[0].enabled){ 
                    this.local_mic.style.background = "#04497B";
                } else { 
                    this.local_mic.style.background = "#7B0406";
                }
            });

            this.local_vid.addEventListener("click", () => {
                this.videoTrack[0].enabled = !this.videoTrack[0].enabled;  
                if (this.videoTrack[0].enabled){ 
                    this.local_vid.style.background = "#04497B";
                } else { 
                    this.local_vid.style.background = "#7B0406";
                }
            });
 
             
        }).then(() => { 
            if (!audio_status){
                this.local_mic.click();
            }
            if (!video_status){
                this.local_vid.click();
            } 
        }).catch(err => {
            console.error("Error accessing media devices:", err);
        });



    }

    teacherScreenDisplay(opener) {
        opener.addEventListener("click", async () => {
            if (opener.textContent === "Open White Board") {
                try {
                    // Start screen share
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: true
                    });
                    this.screenStream = stream;
                    this.localVideo.srcObject = this.screenStream;
                    opener.textContent = "Close White Board";

                    // When teacher stops sharing manually, revert back
                    const screenTrack = stream.getVideoTracks()[0];
                    screenTrack.onended = () => {
                        this.localVideo.srcObject = this.localStream;
                        opener.textContent = "Open White Board";
                    };

                } catch (err) {
                    console.error("Error starting screen share:", err);
                }
            } else {
                // Stop screen share and revert back to camera
                if (this.screenStream) {
                    this.screenStream.getTracks().forEach(track => track.stop());
                    this.screenStream = null;
                }
                this.localVideo.srcObject = this.localStream;
                opener.textContent = "Open White Board";
            }
        });
    }


    sendSignal(action , message){
        var jsonVar = JSON.stringify({
            "peer" : this.username,
            "type" : action,
            "data" : message
        });

        this.ws.send(jsonVar);
    }

    start(){
        if (this.is_join){
            return;
        }
        this.is_join = true;
        this.sendSignal("new-peer", {}) 
    }

    webSocketOnMessage(event){
        const peerData = JSON.parse(event.data);
        var peerUsername = peerData["peer"];
        var action = peerData["type"];
        console.log(peerData);

        if (this.username == peerUsername){
            return; 
        }
        
        const receiver_channel_name = peerData['data']['receiver_channel_name'];

        if (action == "new-peer"){
            this.createOffer(peerUsername, receiver_channel_name);
            return;
        }


        if (action == "new-offer"){
            var offer = peerData['data']['sdp'];
            this.createAnswer(offer , peerUsername , receiver_channel_name);
            return;
        }

        if (action == "new-answer"){
            var answer = peerData['data']['sdp'];
            var peer = this.mapPeers[peerUsername][0];

            peer.setRemoteDescription(answer);
            return;
        }

        if (action == "raise-hand"){
            var status = peerData['data']['status'];
            this.updateHandStatus(peerUsername , status);
            return;
        }

    }

    createOffer(peerUsername, receiver_channel_name){
        var peer = new RTCPeerConnection(null);

        this.addLocalTracks(peer);

        var dc = peer.createDataChannel('channel');
        dc.addEventListener("open", () => {
            console.log("Data channel is open");

        })

        dc.addEventListener("message", this.dcOnMessage);
        
        var remoteVideo = this.createVideo(peerUsername);
        this.setOnTrack(peer, remoteVideo);

        this.mapPeers[peerUsername] = [peer, dc];

        peer.addEventListener("iceconnectionstatechange", () => {
            var iceConnectionState = peer.iceConnectionState;
            console.log("ICE State: ", iceConnectionState);
            if (iceConnectionState == "failed" || iceConnectionState == "disconnected" || iceConnectionState == "closed"){
                delete this.mapPeers[peerUsername];
                if (!iceConnectionState == "closed"){
                    peer.close();
                }

                this.removeVideo(remoteVideo , peerUsername);
            }
        }) 

        peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                // console.log("ICE Candidate:", JSON.stringify(peer.localDescription));
                return;
            }

            this.sendSignal(
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


    
    createAnswer(offer , peerUsername , receiver_channel_name){
        var peer = new RTCPeerConnection(null);

        this.addLocalTracks(peer);
    
        var remoteVideo = this.createVideo(peerUsername);
        this.setOnTrack(peer, remoteVideo);

        peer.addEventListener("datachannel", (event) => {
            peer.dc = event.channel;
            peer.dc.addEventListener("open", () => {
                console.log("Data channel is open"); 
            })

            peer.dc.addEventListener("message", this.dcOnMessage);
            
            this.mapPeers[peerUsername] = [peer, peer.dc];
            
        })


        peer.addEventListener("iceconnectionstatechange", () => {
            var iceConnectionState = peer.iceConnectionState;
            console.log("ICE State: ", iceConnectionState);
            if (iceConnectionState == "failed" || iceConnectionState == "disconnected" || iceConnectionState == "closed"){
                delete this.mapPeers[peerUsername];
                if (!iceConnectionState == "closed"){
                    peer.close();
                }

                this.removeVideo(remoteVideo , peerUsername);
            }
        }) 

        peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                console.log("ICE Candidate:", JSON.stringify(peer.localDescription));
                return;
            }

            this.sendSignal(
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


    addLocalTracks(peer){
        this.localStream.getTracks().forEach(track => {
            peer.addTrack(track, this.localStream);
        });
    }


    createVideo(peerUsername){

        if (this.additional_create_video){
            return this.additional_create_video(peerUsername);
        }

        const video_container = document.getElementById("video_container");
        video_container.insertAdjacentHTML('beforeend',`
            <video class="video" id="${peerUsername}-video" autoplay playsinline></video>
        `); 

        return document.getElementById(`${peerUsername}-video`);
    }
 

    removeVideo(remoteVideo , peerUsername){
        if (this.additional_remove_video){
            this.additional_remove_video(peerUsername);
            return;
        }
        remoteVideo.remove();
    }

    setOnTrack(peer , remoteVideo){
        var remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;
        peer.addEventListener("track", async(event) => {
            remoteStream.addTrack(event.track , remoteStream);
        })
    }

    dcOnMessage(event){
        console.log(event.data);
        console.log("Message Received From Peer");
    } 


    raiseHand(peerUsername){
        this.raise_hand_status = !this.raise_hand_status;
        this.sendSignal(
            "raise-hand",
            {
                'peer' : peerUsername,
                'type' : "raise-hand",
                'status' : this.raise_hand_status 
            }
        )
    }

    updateHandStatus(peerUsername , status){
        const hand_tag = document.getElementById(`raise-hand-${peerUsername}`);
        if (!hand_tag) return;

        if (status == false){
            hand_tag.style.backgroundColor = "#04497B";
        } else {
            hand_tag.style.backgroundColor = "#CBAD2E";
        }
    }




}


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


