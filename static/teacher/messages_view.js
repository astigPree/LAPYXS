
 
const message_id = sessionStorage.getItem('message_id' ); 
const message_main_scroller = document.getElementById("message_main_scroller");
const message_pointer = document.getElementById("message_pointer");


const messageImg = document.getElementById("messageImg");
const messageName = document.getElementById("messageName");
const messageEmail = document.getElementById("messageEmail");

async function loadMessageFirst(){
    
    const response = await sendRequest("../api/api_get_messages", "POST", {
        'receiver' : message_id
    }); 
    
    if (response?.ok){
        const data = await response.json();  

        document.querySelector(".classroom-section").classList.add("open");
        messageImg.src = data?.receiver_image;
        messageName.textContent = data?.receiver_name;
        messageEmail.textContent = data?.receiver_email;


        data?.messages?.forEach(msg=>{
            if (user_id == msg?.sender){
                message_main_scroller.insertAdjacentHTML('beforeend',`
                    <div class="message-content-sender">
                        <p class="poppins-regular">
                            ${msg?.content}
                        </p> 
                    </div> 
                `) 
            } else {
                message_main_scroller.insertAdjacentHTML('beforeend',`
                    <div class="message-content-receiver">
                        <p class="poppins-regular">
                            ${msg?.content}
                        </p> 
                    </div> 
                `)
            }
        })
        message_pointer.scrollIntoView({behavior: "smooth"});

    }
}

function receivedNewMessage(msg){ 
    console.log(msg , "<=====")
    if (user_id == msg?.data?.sender){
        message_main_scroller.insertAdjacentHTML('beforeend',`
            <div class="message-content-sender">
                <p class="poppins-regular">
                    ${msg?.data?.content}
                </p> 
            </div> 
        `) 
    } else {
        message_main_scroller.insertAdjacentHTML('beforeend',`
            <div class="message-content-receiver">
                <p class="poppins-regular">
                    ${msg?.data?.content}
                </p> 
            </div> 
        `)
    }
}


const message_box  = document.getElementById("message_box");
const message_send  = document.getElementById("message_send");

message_send.addEventListener("click", async()=>{
    if (message_box.value?.trim() === "") return;
    if (message_send.disabled) return;
    message_send.disabled = true;
    const message = message_box.value;
    message_box.value = "";
    message_main_scroller.insertAdjacentHTML('beforeend',`
        <div class="message-content-sender">
            <p class="poppins-regular">
                ${message}
            </p> 
        </div> 
    `) 
    message_pointer.scrollIntoView({behavior: "smooth"});
    const response = await sendRequest("../api/api_send_messages", "POST", {
        'receiver' : message_id,
        'content' : message
    }); 
    
    message_send.disabled = false;
})

message_box.addEventListener('input', ()=>{
    if (message_box.value?.trim() == ""){
        message_send.style.opacity = 0.5;
    } else {
        message_send.style.opacity = 1;
    }
})



setTimeout(()=>{

    loadMessageFirst();

    ws_data.add_event( "message", (data)=>{
        receivedNewMessage(data);
        console.log("New Message Received!");
    }); 

},0);

 