

const user_id = sessionStorage.getItem("user_id");
const classroom_id = sessionStorage.getItem("classroom_id");
const mic_status = sessionStorage.getItem("mic_status");
const video_status = sessionStorage.getItem("vid_status");


const view_messages = document.getElementById("view_messages");
const group_message_container = document.getElementById("group_message_container");
const messages_table = document.getElementById("messages_table");
const messages_close_button = document.getElementById("messages_close_button");
const group_message_input = document.getElementById("group_message_input");
const send_group_message = document.getElementById("send_group_message");


view_messages.addEventListener("click", ()=>{
    group_message_container.style.display = "flex";
});

messages_close_button.addEventListener("click", ()=>{
    group_message_container.style.display = "none";
});

send_group_message.addEventListener('click', async()=>{
    if (send_group_message.disabled) return;
    send_group_message.disabled = true;

    const message = group_message_input.value;
    group_message_input.value = "";
    messages_table.insertAdjacentHTML('beforeend',`
        <div class="group-message-right">
            <p class="poppins-regular">${message}</p>
        </div>
    `) 
    const response = await sendRequest("../api/api_send_message_to_vc", "POST", {
        'classroom_id' : classroom_id,
        'content' : message,
        "sender" : user_id
    }); 

    send_group_message.disabled = false;
})


group_message_input.addEventListener('input', ()=>{
    if (group_message_input.value?.trim() == ""){
        send_group_message.style.opacity = 0.5;
    } else {
        send_group_message.style.opacity = 1;
    }
})


function receivedNewMessage(msg){  
    if (msg?.data?.classroom_id != classroom_id) return;
    console.log(msg , "<=====")
    if (user_id == msg?.data?.sender){
        // message_main_scroller.insertAdjacentHTML('beforeend',`
        //     <div class="message-content-sender">
        //         <p class="poppins-regular">
        //             ${msg?.data?.content}
        //         </p> 
        //     </div> 
        // `) 
    } else {
        messages_table.insertAdjacentHTML('beforeend',` 
            <div class="group-message-left">
                <p class="poppins-regular">${msg?.data?.content}</p>
            </div>
        `)
    }
}

setTimeout(()=>{

    ws_data.add_event( "group_message", (data)=>{
        receivedNewMessage(data); 
    });

    


},0);

 
