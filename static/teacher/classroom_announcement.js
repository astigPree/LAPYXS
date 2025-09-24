



const monthField = document.getElementById('month-field');
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

 
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
    const classroom_id = sessionStorage.getItem('classroom_id');
    showLoadingModal(); 
    const response = await sendRequest("../api/add_teacher_classroom_post", "POST", {
        'classroom_id' : classroom_id,
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

    hideLoadingModal(); 
    announcementField.value = '';
    announcementButton.disabled = false;
    get_classroom_materials();
    
}) 

const material_collections = document.getElementById("material_collections");

let materials = {}

async function get_classroom_materials(){
    const classroom_id = sessionStorage.getItem('classroom_id');


    const response = await sendRequest("../api/get_teacher_classroom_post", "POST", {
        'classroom_id' : classroom_id,
        'selected_month' : monthField.value
    }); 

    if (response?.ok){
        const data = await response.json();

        material_collections.innerHTML = '';

        if (data){
            
            if (data?.classroom_post?.length == 0){
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-empty" >
                        <h3 class="poppins-light"> There are no post uploaded this month! </h3>
                    </div>
                `);
                return;
            } 
            data.classroom_post.forEach((material) => {
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
                            <img src="${data?.profile}" alt="">
                            <h4 class="poppins-regular ellipsis">${data?.name}</h4>
                        </div>
                        <button class="delete-announcement poppins-bold">
                            Delete Post
                        </button>

                        <p class="poppins-light">${material?.content}</p>
                        
                        <div class="announcement-dates">
                            <h6 class="poppins-regular">${readable}</h6>
                            <button class="poppins-black" data-post-id="${material?.id}">View Comments</button>
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

monthField.addEventListener('change', async () => {
    await get_classroom_materials();
});






