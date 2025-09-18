const profile_field = document.getElementById("profile-field");
const fullname_field = document.getElementById("fullname-field");
const email_field = document.getElementById("email-field");
const password_field = document.getElementById("password-field");
const confirm_password_field = document.getElementById("confirm-password-field");
const school_name_field = document.getElementById("school-name-field");
const subject_area_field = document.getElementById("subject-area-field");
const description_field = document.getElementById("description-field");
const grade_level_field = document.getElementById("grade-level-field");

const profile_image = document.getElementById("profile-image");
const profile_button = document.getElementById("profile-button");

const update_button = document.getElementById("update-button");
const logout_button = document.getElementById("logout-button");


profile_button.addEventListener("click", () => {
    profile_field.click();
});

profile_field.addEventListener("change", () => {
    profile_image.src = URL.createObjectURL(profile_field.files[0]);
});



function prepare_teacher_data(){ 
    return {
        'fullname': fullname_field?.value,
        'email': email_field?.value,
        'password': password_field?.value,
        'confirm_password': confirm_password_field?.value,
        'school_name': school_name_field?.value,
        'subject_area': subject_area_field?.value,
        'description': description_field?.value,
        'profile': profile_field?.files[0] || null,
        'register_type': register_type
    };
}

function prepare_student_data(){
    return {
        'fullname': fullname_field?.value,
        'email': email_field?.value,
        'password': password_field?.value,
        'confirm_password': confirm_password_field?.value,
        'school_name': school_name_field?.value,
        'grade_level': grade_level_field?.value,
        'profile': profile_field?.files[0] || null,
        'register_type': register_type
    };
}


update_button.addEventListener('click' , async () => {

    console.log('register button clicked', update_button.disabled);
    if (update_button.disabled) return;

    update_button.disabled = true;

    showLoadingModal();

    let data = null;
    if(register_type == 'teacher'){ 
        data = prepare_teacher_data();
    }
    else if(register_type == 'student'){ 
        data = prepare_student_data();
    }

    console.log(data);

    const response = await sendRequest('../api/update', 'POST', data);
    hideLoadingModal();

    if (!response){
        // Todo: show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            update_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // Todo: show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            update_button.disabled = false;
        }, 2000); 
        return;
    }
 
    const response_data = await response.json();
    if (response_data){
        showSuccessModal('Account created successfully.');
        setTimeout(() => {
            window.location.reload();
            hideSuccessModal(); 
        }, 2000); 
    }
 


});




logout_button.addEventListener('click' , async () => { 
    if (logout_button.disabled) return;

    logout_button.disabled = true;

    showLoadingModal();

    const response = await sendRequest('../api/logout', 'POST');
    hideLoadingModal();

    if (!response){
        // Todo: show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            logout_button.disabled = false;
        }, 2000); 
        return;
    }

    console.log(response.ok);
    if (!response?.ok){
        // Todo: show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            logout_button.disabled = false;
        }, 2000); 
        return;
    }
 
    const response_data = await response.json();
    if (response_data){
        showSuccessModal('Logout successfully.');
        setTimeout(() => {
            window.location.href = response_data?.url || '{% url "login_page" %}'; 
        }, 2000); 
    }

});







