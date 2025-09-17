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

const register_button = document.getElementById("register-button");


profile_button.addEventListener("click", () => {
    profile_field.click();
});

profile_field.addEventListener("change", () => {
    profile_image.src = URL.createObjectURL(profile_field.files[0]);
});


function prepare_teacher_data(){ 
    return {
        'fullname': fullname_field.value,
        'email': email_field.value,
        'password': password_field.value,
        'confirm_password': confirm_password_field.value,
        'school_name': school_name_field.value,
        'subject_area': subject_area_field.value,
        'description': description_field.value
    };
}

function prepare_student_data(){
    return {
        'fullname': fullname_field.value,
        'email': email_field.value,
        'password': password_field.value,
        'confirm_password': confirm_password_field.value,
        'school_name': school_name_field.value,
        'grade_level': grade_level_field.value
    };
}





