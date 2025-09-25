

const classroom_name_tag = document.getElementById("classroom_name_tag");
const classroom_subject_tag = document.getElementById("classroom_subject_tag");
const classroom_link_id = document.getElementById("classroom_link_id");
const classroom_description = document.getElementById("classroom_description");
const copy_link_button = document.getElementById("copy_link_button");
 


(async()=>{

const response = await sendRequest("../api/visit_student_classroom", "POST", {
    'classroom_id' : sessionStorage.getItem('classroom_id')
}); 
document.querySelector('.classroom-section').classList.add('open');

if (response?.ok){
    const data = await response.json();

    if (data){ 
        classroom_name_tag.innerHTML = data.classroom.classroom_name;
        classroom_subject_tag.innerHTML = data.classroom.classroom_subject;
        classroom_link_id.innerHTML = data.classroom.classroom_link_id;
        classroom_description.innerHTML = data.classroom.classroom_description;
    }

}


})();
 

copy_link_button.addEventListener("click", () => {
    navigator.clipboard.writeText(classroom_link_id.innerHTML);
});


const material_collections = document.getElementById("material_collections");


const monthField = document.getElementById('month-field'); 
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

let items = {};






async function get_materials_and_activities(){
    const classroom_id = sessionStorage.getItem('classroom_id');


    const response = await sendRequest("../api/get_student_classroom_post", "POST", {
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
                            <img src="/media/${material?.teacher__profile_image}" alt="">
                            <h4 class="poppins-regular ellipsis">${material?.teacher__fullname}</h4>
                        </div> 

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

monthField.addEventListener('change', () => {
    get_materials_and_activities();
});

get_materials_and_activities();



material_collections.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return; // Click wasn't on a relevant button

    const action = button.getAttribute("data-action");
    const postId = button.getAttribute("data-post-id");

    console.log("Action:", action);
    console.log("Post ID:", postId);

    // You can now handle the action accordingly
    if  (action === "view") {
        // handle view logic
        sessionStorage.setItem('post_id', postId);
        // window.location.href = classroom_view_announcement_link;

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

    const response = await sendRequest("../api/leave_student_classroom", "POST", {
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
        showSuccessModal('You have successfully left the classroom.');
        setTimeout(() => {
            window.location.href = clasrroms_pages_link; 
        }, 2000);
    }
});















