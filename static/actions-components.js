// ========================= WEBSOCKET HANDLER
class WSStudent{



    constructor(){
        this.ws = new WebSocket(`ws://${window.location.host}/ws/lapyxs/`);
    }

    start(){

        this.ws.onclose = async(event) =>{
            console.log(event)
        }

        this.ws.onerror = async(event)=>{
            console.log(event);
        }
        
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

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

            console.log("WS Received : ", data);
        };

    }


    send(data){
        this.ws.send(
            JSON.stringify(data)
        )
    }
}


// const ws_data = new WSStudent();
// setTimeout(()=>{
//     ws_data.start()
// }, 0);


// setTimeout(()=>{
//     ws_data.send({
//         'data' : 'hello po'
//     })
// }, 1000);
// ===========================================

 


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




setTimeout( async ()=>{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    notification_date.value = `${year}-${month}`; 
    await firstCheckNotification();
}, 100);


notification_date.addEventListener("change", async () => {
    await firstCheckNotification();
});