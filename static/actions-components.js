
const account_notification_button = document.getElementById("account-notification-button");
const notifications_container_back_icon = document.getElementById("notifications-container-back-icon");
const notification_red = document.getElementById("notification-red");
const notification_list = document.getElementById("notification_list");
const notification_date = document.getElementById("notification-date");
let has_new_notif = false;
let notif_close = true;


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
                notification_list.insertAdjacentHTML('beforeend', ` 
                    <div class="notification-content">
                        <h4 class="poppins-bold">${notification.title}</h4>
                        <h5 class="poppins-regular">${notification.content}</h5>
                    </div>

                `)
            })
        }

    }
}


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
                notification_list.insertAdjacentHTML('beforeend', ` 
                    <div class="notification-content">
                        <h4 class="poppins-bold">${notification.title}</h4>
                        <h5 class="poppins-regular">${notification.content}</h5>
                    </div>

                `)
            })
        }

    }
}




setTimeout(()=>{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    notification_date.value = `${year}-${month}`;
    firstCheckNotification();
}, 100);