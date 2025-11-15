// ========================= WEBSOCKET HANDLER
// class WSStudent{

//     list_of_events = {} // { name : func }

//     constructor(){
//         var room_name = sessionStorage.getItem("room_name");
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

//             if (this.is_joining) {
//                 const roomName = sessionStorage.getItem("room_name");
//                 const userId = sessionStorage.getItem("user_id");

//                 if (roomName && userId && this.ws.readyState === WebSocket.OPEN) {
//                     this.send({
//                         type: "joined",
//                         room_name: roomName,
//                         user_id: userId
//                     });
//                 }
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
//                     this.list_of_events["conferencing"](data);
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
// var ws_data = new WSStudent();
// var WS_DELAY = 0;
// console.log("WS_DELAY : ", WS_DELAY);
// setTimeout(()=>{
//     ws_data.start()
// }, WS_DELAY);


// setTimeout(()=>{
//     ws_data.send({
//         'data' : 'hello po'
//     })
// }, 1000);
// ===========================================





// ========================= WEBSOCKET HANDLER
class WSStudent{ 
    list_of_events = {}; // { name : func }
    already_opened = false;
    open_event = null;


    constructor(){
        var room_name = sessionStorage.getItem("room_name" , "1234");
        this.is_joining = false;
        const protocol = location.protocol === "https:" ? "wss" : "ws";
        if (room_name){
            this.is_joining = true;
            this.ws = new WebSocket(`${protocol}://${window.location.host}/ws/lapyxs/${room_name}/`);
        } else{
            this.ws = new WebSocket(`${protocol}://${window.location.host}/ws/lapyxs/clients/`);
        }
        console.log(
            `${protocol}://${window.location.host}/ws/lapyxs/${room_name}/`
        )
    }

    start(){

        this.ws.onopen = async () => {
            console.log("WS Connected"); 
            this.already_opened = true;
            if (this.open_event){
                this.open_event();
            }
        };

        this.ws.onclose = async(event) =>{
            console.log(event)
        }

        this.ws.onerror = async(event)=>{
            console.log(event);
        }
        
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data?.type === "notif"){
                if (this.list_of_events[data?.type]){
                    this.list_of_events[data?.type](data);
                }
            } else if (data?.type === "message"){
                if (this.list_of_events[data?.type]){
                    this.list_of_events[data?.type](data);
                }
            } else if (data?.type === "group_message"){
                if (this.list_of_events[data?.type]){
                    this.list_of_events[data?.type](data);
                }
            } else if (data?.type === "joined"){
                if (this.list_of_events[data?.type]){
                    this.list_of_events[data?.type](data);
                }
            } else {
                if (this.list_of_events["conferencing"]){
                    this.list_of_events["conferencing"](event);
                }
            }

            // if (data.type === "offer") {
            //     await pc.setRemoteDescription(new RTCSessionDescription(data));
            //     const answer = await pc.createAnswer();
            //     await pc.setLocalDescription(answer);
            //     ws.send(JSON.stringify(pc.localDescription));
            // } else if (data.type === "answer") {
            //     await pc.setRemoteDescription(new RTCSessionDescription(data));
            // } else if (data.type === "candidate") {
            //     await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            // }

            // console.log("WS Received : ", data);
        };

    }


    send(data){
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN){
            console.warn("WebSocket not ready, signal dropped:", data);
            return;
        }
        this.ws.send(
            JSON.stringify(data)
        )
    }

    add_already_opened_event(func){
        if (this.already_opened){
            func();
        } else {
            this.open_event = func;
        }
        
    }

    add_event(name , func){
        this.list_of_events[name] = func;
    }
}

try{

    var ws_data = new WSStudent();
    var WS_DELAY = 0;
    console.log("WS_DELAY : ", WS_DELAY);
    setTimeout(()=>{
        ws_data.start()
    }, WS_DELAY);
    
} catch (error){
    console.log(error);
}























 
try{
 

const account_notification_button = document.getElementById("account-notification-button");
const notifications_container_back_icon = document.getElementById("notifications-container-back-icon");
const notification_red = document.getElementById("notification-red");
const notification_list = document.getElementById("notification_list");
const notification_date = document.getElementById("notification-date");
let has_new_notif = false;
let notif_close = true;
let notifications_dict = {};




account_notification_button.addEventListener("click", function() { 
    document.getElementById("notifications-container").classList.toggle("toggled-notifications-container");
    if (notif_close){
        seenCheckNotification();
        notif_close = false;
    }
});

notifications_container_back_icon.addEventListener("click", function() { 
    document.getElementById("notifications-container").classList.toggle("toggled-notifications-container");
    if (!notif_close){
        notif_close = true;
    }
});


async function firstCheckNotification(){
    
    const response = await sendRequest("../api/notifications", "POST", {
        'selected_month' : notification_date.value
    }); 
    
    if (response?.ok){
        const data = await response.json(); 

        if (data){

            if (data?.notifications?.some(notif => notif.is_seen == false)){
                has_new_notif = true;
                notification_red.style.display = 'block';
            } else {
                has_new_notif = false;
                notification_red.style.display = 'none';
            }

            notification_list.innerHTML = '';
            data.notifications.forEach(notification =>{ 
                notifications_dict[notification.id] = notification;
                const link = notification.id; 
                notification_list.insertAdjacentHTML('beforeend', ` 
                    <div class="notification-content" data-link="${link || 'no-link' }">
                        <h4 class="poppins-bold">${notification.title}</h4>
                        <h5 class="poppins-regular">${notification.content}</h5>
                    </div>

                `)
            })
        }

    }
}

 
notification_list.addEventListener('click', function(event){
    const divBut = event?.target?.closest('div'); 
    if (!divBut) return;
    const link = divBut?.dataset?.link;
    if (!link || link == 'no-link') return;
    // window.location.href = `/${link}` 
    new Function(notifications_dict[link]?.actions)();
    window.location.href = `/${notifications_dict[link]?.link}`;

});

async function seenCheckNotification(){
    
    const response = await sendRequest("../api/seen_notification", "POST", {
        'selected_month' : notification_date.value
    }); 
    
    if (response?.ok){
        const data = await response.json(); 

        if (data){

            if (data?.notifications?.some(notif => notif.is_seen == false)){
                has_new_notif = true;
                notification_red.style.display = 'block';
            } else {
                has_new_notif = false;
                notification_red.style.display = 'none';
            }

            notification_list.innerHTML = '';
            data.notifications.forEach(notification =>{
                notifications_dict[notification.id] = notification;
                const link = notification.id; 
                notification_list.insertAdjacentHTML('beforeend', ` 
                    <div class="notification-content" data-link="${link || 'no-link' }">
                        <h4 class="poppins-bold">${notification.title}</h4>
                        <h5 class="poppins-regular">${notification.content}</h5>
                    </div>

                `)
            })
        }

    }
}

async function hasNewNotification(){
    
    const response = await sendRequest("../api/api_has_new_notification", "POST", {
        'selected_month' : notification_date.value
    }); 
    
    if (response?.ok){
        const data = await response.json(); 

        if (data){
            console.log(data);
            if (data?.has_notif){
                has_new_notif = true;
                notification_red.style.display = 'block';
            } else {
                has_new_notif = false;
                notification_red.style.display = 'none';
            }
 
        }

    }
}


setTimeout( async ()=>{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    notification_date.value = `${year}-${month}`; 
    await hasNewNotification();
    ws_data.add_event( "notif", (data)=>{
        hasNewNotification();
        console.log("New Notification Received!");
    });
}, 100);


notification_date.addEventListener("change", async () => {
    await firstCheckNotification();
});




} catch(e){
    console.log(e);
}
