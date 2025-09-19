
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



(async()=>{
const classroom_id = sessionStorage.getItem('classroom_id');

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

const response = await sendRequest("../api/get_teacher_classroom_materials", "POST", {
    'classroom_id' : classroom_id,
    'selected_month' : monthField.value
}); 

if (response?.ok){
    const data = await response.json();

    if (data){ 
    }
}


})();

