

const edit_classroom = document.getElementById("edit_classroom"); 
const classroom_edit_modal = document.getElementById("classroom_edit_modal");
const cancel_edit_button = document.getElementById("cancel_edit_button");
const update_edit_button = document.getElementById("update_edit_button");

const classroom_name_tag = document.getElementById("classroom_name_tag");
const classroom_subject_tag = document.getElementById("classroom_subject_tag");
const classroom_link_id = document.getElementById("classroom_link_id");
const copy_link_button = document.getElementById("copy_link_button");


const classroom_name = document.getElementById("classroom_name");
const classroom_subject = document.getElementById("classroom_subject");
const classroom_description = document.getElementById("classroom_description");


const monthField = document.getElementById('month-field');

edit_classroom.addEventListener("click", function() {
    classroom_edit_modal.style.display = "flex";
});

cancel_edit_button.addEventListener("click", function() {
    classroom_edit_modal.style.display = "none";
});



update_edit_button.addEventListener("click", async () => { 

    if (update_edit_button.disabled) {
        return;
    }

    update_edit_button.disabled = true;
    showLoadingModal();
    
    const classroom_id = sessionStorage.getItem('classroom_id');

    const response = await sendRequest("../api/update_classroom", "POST", {
        'classroom_id' : classroom_id,
        "classroom_name": classroom_name?.value,
        "classroom_description": classroom_description?.value,
        "classroom_subject": classroom_subject?.value
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            update_edit_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            update_edit_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Classroom updated successfully.');
        setTimeout(() => {
            window.location.reload();
            hideSuccessModal();
        }, 2000);
    }
});



(async()=>{
const classroom_id = sessionStorage.getItem('classroom_id');

const response = await sendRequest("../api/get_teacher_selected_classroom", "POST", {
    'classroom_id' : classroom_id
}); 

if (response?.ok){
    const data = await response.json();

    if (data){
        document.querySelector('.classroom-section').classList.add('open');
        classroom_name.value = data.classroom.classroom_name;
        classroom_subject.value = data.classroom.classroom_subject;
        classroom_description.value = data.classroom.classroom_description;

        classroom_name_tag.innerHTML = data.classroom.classroom_name;
        classroom_subject_tag.innerHTML = data.classroom.classroom_subject;
        classroom_link_id.innerHTML = data.classroom.classroom_link_id;
    }
}


})();

copy_link_button.addEventListener("click", () => {
    navigator.clipboard.writeText(classroom_link_id.innerHTML);
});

 
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
                        <button data-action="delete" class="delete-announcement poppins-bold" data-post-id="${material?.id}">
                            Delete Post
                        </button>

                        <p class="poppins-light">${material?.content}</p>
                        
                        <div class="announcement-dates">
                            <h6 class="poppins-regular">${readable}</h6>
                            <button data-action="view" class="poppins-black" data-post-id="${material?.id}">View Comments</button>
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

 
material_collections.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return; // Click wasn't on a relevant button

    const action = button.getAttribute("data-action");
    const postId = button.getAttribute("data-post-id");

    console.log("Action:", action);
    console.log("Post ID:", postId);

    // You can now handle the action accordingly
    if (action === "delete") {
        // handle delete logic
        delete_material_modal.style.display = "flex";
        selected_material_id = parseInt(postId);

    } else if (action === "view") {
        // handle view logic
        sessionStorage.setItem('post_id', postId);
        window.location.href = classroom_view_announcement_link;

    }
});



const classroom_delete_modal = document.getElementById("classroom_delete_modal"); 
const delete_classroom = document.getElementById("delete_classroom");
const cancel_delete_button = document.getElementById("cancel_delete_button"); 
const continue_delete_button = document.getElementById("continue_delete_button");

delete_classroom.addEventListener("click", function() {
    classroom_delete_modal.style.display = "flex";
});

cancel_delete_button.addEventListener("click", function() {
    classroom_delete_modal.style.display = "none";
});


continue_delete_button.addEventListener("click", async () => {

    if (continue_delete_button.disabled) {
        return;
    }

    continue_delete_button.disabled = true;
    showLoadingModal();
    
    const classroom_id = sessionStorage.getItem('classroom_id');

    const response = await sendRequest("../api/delete_classroom", "POST", {
        'classroom_id' : classroom_id, 
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            continue_delete_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            continue_delete_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Classroom deleted successfully.');
        setTimeout(() => {
            window.location.href = clasrroms_pages_link; 
        }, 2000);
    }
});


 

var selected_material_id = null; 
const delete_material_modal = document.getElementById("delete_material_modal");
const continue_delete_material_button = document.getElementById("continue_delete_material_button");
const cancel_delete_material_button = document.getElementById("cancel_delete_material_button"); 

cancel_delete_material_button.addEventListener("click", function() {
    delete_material_modal.style.display = "none";
});
 

continue_delete_material_button.addEventListener("click", async () => {

    if (continue_delete_material_button.disabled) {
        return;
    }

    continue_delete_material_button.disabled = true;
    showLoadingModal();
     
    const response = await sendRequest("../api/delete_teacher_classroom_post", "POST", {
        'post_id' : selected_material_id, 
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            continue_delete_material_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            continue_delete_material_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal(data?.success || 'Post deleted successfully.');
        get_classroom_materials();
        setTimeout(() => {  
            delete_material_modal.style.display = "none";
            continue_delete_material_button.disabled = false;
            hideSuccessModal();
        }, 2000);
    }
});

