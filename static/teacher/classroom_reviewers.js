
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


const material_collections = document.getElementById("material_collections");

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

let materials = {}

async function get_classroom_materials(){
    const classroom_id = sessionStorage.getItem('classroom_id');


    const response = await sendRequest("../api/get_teacher_classroom_materials", "POST", {
        'classroom_id' : classroom_id,
        'selected_month' : monthField.value
    }); 

    if (response?.ok){
        const data = await response.json();

        material_collections.innerHTML = '';

        if (data){
            
            if (data?.materials?.length == 0){
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-empty" >
                        <h3 class="poppins-light"> There are no material uploaded this month! </h3>
                    </div>
                `);
                return;
            }
            
            data.materials.forEach((material) => {
                materials[material.id] = material; 
                const date = new Date(material.created_at); 
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-container">
                        <img data-material-id="${material.id}" data-action="delete" src="/static/assets/delete-materials-icon.svg" alt="" class="collections-delete-button">
                        <h2 class="poppins-regular ellipsis"> ${material.material_name} </h2>
                        <h5 class="poppins-light ellipsis">Date Uploaded : ${date.toLocaleDateString('en-US')}</h5>
                        <button class="poppins-light collection-visit-button" data-material-id="${material.id}" data-action="view" >
                            Click here to view
                        </button> 
                        <span class="collection-category poppins-black">
                            Material
                        </span>
                    </div>
                `);
            })    
        }
    }


};

monthField.addEventListener('change', () => {
    get_classroom_materials();
});

get_classroom_materials();

 

material_collections.addEventListener('click', function (e) {
    const target = e.target;
    const action = target.dataset.action;
    const materialId = target.dataset.materialId;

    if (action && materialId) {
        console.log(`Action: ${action}, Material ID: ${materialId}`);

        // You can branch logic here
        if (action === 'delete') {
            // Handle delete
            delete_material_modal.style.display = "flex";
            selected_material_id = parseInt(materialId);
        } else if (action === 'view') {
            // Handle view
            sessionStorage.setItem('material_id', materialId);
            window.location.href = classroom_view_reviewer_link;
        }
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
     
    const response = await sendRequest("../api/delete_material", "POST", {
        'material_id' : selected_material_id, 
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
        showSuccessModal('Material deleted successfully.');
        get_classroom_materials();
        setTimeout(() => {  
            delete_material_modal.style.display = "none";
            hideSuccessModal();
        }, 2000);
    }
});


const add_material_modal = document.getElementById("add_material_modal");
const add_matterial_button = document.getElementById("add_matterial_button");
const add_collection_button = document.getElementById("add_collection_button");
const cancel_adding_material_button = document.getElementById("cancel_adding_material_button");

cancel_adding_material_button.addEventListener("click", function() {
    add_material_modal.style.display = "none";
});

add_collection_button.addEventListener("click", function() {
    add_material_modal.style.display = "flex";
});


const material_name = document.getElementById("material_name");
const material_description = document.getElementById("material_description");
const material_link = document.getElementById("material_link");
const material_file = document.getElementById("material_file");
const material_file_button = document.getElementById("material_file_button");


material_file_button.addEventListener("click", () => {
    material_file.click();
});

material_file.addEventListener("change", () => { 
    material_file_button.value = material_file.files[0].name;
});


function material_prepare_data(){
    return {
        'classroom_id' : sessionStorage.getItem('classroom_id'),
        'material_name' : material_name?.value,
        'material_description' : material_description?.value,
        'material_link' : material_link?.value,
        'material_file' : material_file?.files[0]
    }
}


add_matterial_button.addEventListener("click", async () => {

    if (add_matterial_button.disabled) {
        return;
    }

    add_matterial_button.disabled = true;
    showLoadingModal('Adding material...');
    
    const response = await sendRequest("../api/create_material", "POST", material_prepare_data());
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            add_matterial_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            add_matterial_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Material added successfully.');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
})