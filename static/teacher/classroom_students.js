
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

const material_collections = document.getElementById("material_collections");

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


const response_students = await sendRequest("../api/teacher_check_students", "POST", {
    'classroom_id' : classroom_id
}); 

if (response_students?.ok){
    const data2 = await response_students.json();

    material_collections.innerHTML = "";
    if (data2?.students?.length < 1){
        material_collections.insertAdjacentHTML('beforeend', `
        <div class="material-empty" >
            <h3 class="poppins-light"> There are no students in this classroom! </h3>
        </div>
        `)
        return;
    }
    data2?.students?.forEach(student => { 
        material_collections.insertAdjacentHTML('beforeend', ` 
        <div class="student-container">

            <div class="student-profile">
                <img src="${student?.image}" alt="">
            </div>
            <div class="student-information">
                <h4 class="poppins-regular ellipsis">${student?.name}</h4>
                <h5 class="poppins-light ellipsis">${student?.email}</h5>
            </div>

            <button class="poppins-black" data-key="${student?.id}">
                Check Student
            </button>
             
        </div>
        `)
    });
}
 
})();


copy_link_button.addEventListener("click", () => {
    navigator.clipboard.writeText(classroom_link_id.innerHTML);
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


 

material_collections.addEventListener('click', function (e) {
    const target = e.target;
    const key = target.dataset.key; 

    if (key) {
        console.log(`key: ${key}`); 
        // You can branch logic here 
        sessionStorage.setItem('student', key);
        window.location.href = classroom_view_student_link;
    }
});

