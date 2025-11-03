

const messages_container = document.getElementById("messages_container");


(async()=>{
    
    const response = await sendRequest("../api/student_get_list_of_message", "POST", {}); 

    if (response?.ok){
        const data = await response.json();
        document.querySelector('.classroom-section').classList.add('open');
        if (!data) return;
        messages_container.innerHTML = '';
        data?.messages.forEach(message=>{
            messages_container.insertAdjacentHTML('beforeend',`
                <div class="participant-container" data-id="${message.id}" >
                    <img src="${message?.image}" alt="">
                    <div class="participant-info">
                        <h4 class="poppins-${message?.is_read ? "regular" : "bold"} ellipsis">${message?.name}</h4>
                        <h5 class="poppins-${message?.is_read ? "light" : "regular"} ellipsis">${message?.last_message}</h5>
                    </div>
                </div> 
            `)
        })


        if (data?.messages?.lenght == 0){
            messages_container.insertAdjacentHTML('beforeend',` 
                <div class="no-paticipant" >
                    <h6 class="poppins-light">There is no messages yet.</h6>
                </div> 
            `) 
        }
       

    } 


})();


messages_container.addEventListener('click' , function(event){
    const mess = event?.target?.closest('.participant-container');
    if (!mess) return;
    const student_id = mess?.dataset?.id; 

    sessionStorage.setItem('message_id', student_id); 
    window.location.href = link_open_messages;
})

