

(async()=>{
const classroom_id = sessionStorage.getItem('post_id');

const response = await sendRequest("../api/get_teacher_classroom_selected_post", "POST", {
    'post_id' : classroom_id
}); 

if (response?.ok){
    const data = await response.json();

    if (data){ 
        document.querySelector('.classroom-section').classList.add('open');
        const date = new Date(data?.created_at); 
        // Example: "September 24, 2025 at 8:39 AM"
        const readable = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila'  // Optional: convert to PH time
        }); 
        document.querySelector('.classroom-section').classList.add('open'); 
        document.getElementById('main_pic').src = data?.profile;
        document.getElementById('main_name').textContent = data?.name; 
        document.getElementById('main_content').textContent = data?.content;
        document.getElementById('main_date').textContent = readable;

    }
}


})();

 

const announcementField = document.getElementById('announcement');
const announcementButton = document.getElementById('announcement_button');

announcementField.addEventListener('input', function () {
    const hasText = this.value.trim().length > 0;
    announcementButton.style.opacity = hasText ? '1' : '0.5';
    if (hasText) {
        announcementButton.style.cursor = 'pointer';
    } else {
        announcementButton.style.cursor = 'not-allowed';
    }
});


announcementButton.addEventListener('click', async function () {
    if (!announcementField.value.trim()) {
        return;
    } 

    if (announcementButton.disabled) {
        return;
    }

    announcementButton.disabled = true;
    const post_id = sessionStorage.getItem('post_id');
    showLoadingModal(); 
    const response = await sendRequest("../api/reply_teacher_classroom_post", "POST", { 
        'post_id' : post_id,
        'content' : announcementField.value.trim()
    });

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            announcementButton.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            announcementButton.disabled = false;
        }, 2000); 
        return;
    }
    await get_classroom_materials();
    hideLoadingModal(); 
    announcementField.value = '';
    announcementButton.disabled = false; 
    
}) 









const material_collections = document.getElementById("material_collections");

let materials = {}

async function get_classroom_materials(){
    const classroom_id = sessionStorage.getItem('post_id');


    const response = await sendRequest("../api/get_teacher_classroom_post_replies", "POST", {
        'post_id' : classroom_id 
    }); 

    if (response?.ok){
        const data = await response.json();

        material_collections.innerHTML = '';

        if (data){
            
            if (data?.classroom_post_reply?.length == 0){
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-empty" >
                        <h3 class="poppins-light"> There are no replies to this post! </h3>
                    </div>
                `);
                return;
            } 
            data.classroom_post_reply.forEach((material) => {
                materials[material.id] = material; 
                
                const date = new Date(material?.created_at); 
                // Example: "September 24, 2025 at 8:39 AM"
                const readable = date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila'  // Optional: convert to PH time
                }); 
                material_collections.insertAdjacentHTML("beforeend", `  
                    <div class="announcement">
                        <div class="announcement-title-box">
                            <img src="/media/${material?.replier__profile_image}" alt="">
                            <h4 class="poppins-regular ellipsis">${material?.replier__fullname}</h4>
                        </div> 

                        <p class="poppins-light">${material?.content}</p>
                        
                        <div class="announcement-dates">
                            <h6 class="poppins-regular">${readable}</h6> 
                        </div>

                    </div>
                `);
            })    
        }
    }


};
 
setTimeout(async() => {
    await get_classroom_materials();
}, 100);