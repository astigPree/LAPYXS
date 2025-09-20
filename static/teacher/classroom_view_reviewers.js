

const delete_material = document.getElementById("delete_material");
const delete_material_modal = document.getElementById("delete_material_modal");
const continue_delete_material_button = document.getElementById("continue_delete_material_button");
const cancel_delete_material_button = document.getElementById("cancel_delete_material_button"); 

delete_material.addEventListener("click", function() {
    delete_material_modal.style.display = "flex";
});

cancel_delete_material_button.addEventListener("click", function() {
    delete_material_modal.style.display = "none";
});
 

continue_delete_material_button.addEventListener("click", async () => {

    if (continue_delete_material_button.disabled) {
        return;
    }

    continue_delete_material_button.disabled = true;
    showLoadingModal();
    const material_id = sessionStorage.getItem('material_id');
     
    const response = await sendRequest("../api/delete_material", "POST", {
        'material_id' : material_id, 
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
        setTimeout(() => { 
            window.location.href = clasrroms_reviewers_page_link;
        }, 2000);
    }
});



const reviewer_title = document.getElementById("reviewer_title");
const reviewer_descriptions = document.getElementById("reviewer_descriptions");
const reviewer_file = document.getElementById("reviewer_file");
const reviewer_link = document.getElementById("reviewer_link");

(async()=>{

const material_id = sessionStorage.getItem('material_id'); 

const response = await sendRequest("../api/get_teacher_material", "POST", {
    'material_id' : material_id
}); 

if (response?.ok){
    const data = await response.json();

    if (data){
        document.querySelector('.classroom-section').classList.add('open');
        reviewer_title.textContent = data.material_name;
        reviewer_descriptions.textContent = data.material_description;
        if (data.material_file){
            reviewer_file.href = data.material_file;
        } else {
            reviewer_file.style.display = 'none';
        }
        if (data.material_link?.length > 0){
            reviewer_link.href = data.material_link;
            reviewer_link.textContent = data.material_link;
        } else {
            reviewer_link.style.display = 'none';
        }

        material_name.value = data.material_name;
        material_description.value = data.material_description;
        material_link.value = data.material_link;
    }


}
    


})();










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
        'material_id' : sessionStorage.getItem('material_id'),
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
    
    const response = await sendRequest("../api/update_material", "POST", material_prepare_data());
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
        showSuccessModal('Material updated successfully.');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
})






















