


const classroom_name_tag = document.getElementById("classroom_name_tag");
const classroom_subject_tag = document.getElementById("classroom_subject_tag");
const classroom_link_id = document.getElementById("classroom_link_id");
const classroom_description = document.getElementById("classroom_description");
const copy_link_button = document.getElementById("copy_link_button");
 


const monthField = document.getElementById('month-field');




copy_link_button.addEventListener("click", () => {
    navigator.clipboard.writeText(classroom_link_id.innerHTML);
});

const material_collections = document.getElementById("material_collections");

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

let items = {}



async function get_materials_and_activities(){
    const classroom_id = sessionStorage.getItem('classroom_id');


    const response = await sendRequest("../api/get_student_activities_materials", "POST", {
        'classroom_id' : classroom_id,
        'selected_month' : monthField.value
    }); 

    if (response?.ok){
        const data = await response.json();

        material_collections.innerHTML = '';

        if (data){
            
            if (data?.all_items?.length == 0){
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-empty" >
                        <h3 class="poppins-light"> There are no material or activity uploaded this month! </h3>
                    </div>
                `);
                return;
            }
            
            data.all_items.forEach((item) => {
                items[item.id] = item;  
                let icon = null;
                if (item.is_joined == true){
                    icon = check_activity;
                } else{
                    icon = uncheck_activity;
                }
                material_collections.insertAdjacentHTML("beforeend", `  
                    <div class="student-material-container">
                        <img src="${icon}" alt=""> 
                        <h1 class="poppins-regular ellipsis">${item.name}</h1>
                        <h2 class="poppins-light ellipsis">Date Uploaded : ${item.uploaded_date}</h2>
                        <h2 class="poppins-light ellipsis">Due Date : ${item.due_date ? item.due_date : 'N/A'} </h2>

                        <span class="collection-category poppins-black">
                            ${item.type}
                        </span>
                        <button data-type="${item.type}" class="poppins-light collection-visit-button" data-id="${item.id}" >
                            Click here to view
                        </button>

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




material_collections.addEventListener('click', function (e) {
    const target = e.target;

    // Check if the clicked element is the view button
    if (target.classList.contains('collection-visit-button')) {
        const materialId = target.dataset.id;
        const materialType = target.dataset.type;
        console.log('View material ID:', materialId + ' Type: ' + materialType);

        // You can now trigger a modal, fetch details, or redirect
        sessionStorage.setItem('material_id', materialId);
        if (materialType == 'Material'){
            window.location.href = classroom_view_reviewer_link;
        } 
    }
});







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





