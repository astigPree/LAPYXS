

const create_classroom_button = document.getElementById("create_classroom_button");
const classroom_add_modal = document.getElementById("classroom_add_modal");

const classroom_name = document.getElementById("classroom_name");
const classroom_description = document.getElementById("classroom_description");
const classroom_subject = document.getElementById("classroom_subject");

const continue_button = document.getElementById("continue_button");
const cancel_button = document.getElementById("cancel_button");


create_classroom_button.addEventListener("click", () => {
    classroom_add_modal.style.display = "flex";
})

cancel_button.addEventListener("click", () => {
    classroom_add_modal.style.display = "none";
})
 

continue_button.addEventListener("click", async () => { 

    if (continue_button.disabled) {
        return;
    }

    continue_button.disabled = true;
    showLoadingModal();

    const response = await sendRequest("../api/create_classroom", "POST", {
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
            continue_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            continue_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Classroom created successfully.');
        setTimeout(() => {
            window.location.reload();
            hideSuccessModal();
        }, 2000);
    }
});


(async()=>{

const response = await sendRequest("../api/get_classroom", "POST", {}); 

if (response?.ok){
    const data = await response.json();

    const classroom_container = document.getElementById("classroom_selections");
    classroom_container.innerHTML = "";

    data.classrooms.forEach((classroom) => {
        classroom_container.insertAdjacentHTML("beforeend", ` 
            <div class="classroom-container">
                <div class="classroom-content">
                    <h2 class="poppins-medium ellipsis">${classroom.number_of_students}</h2> 
                    <h3 class="poppins-light ellipsis">${classroom.classroom_name}</h3>
                </div>
                <img data-key="${classroom.id}" src="/static/assets/classroom-visit-icon.svg" alt="classroom-icon" class="classroom-icon">
            </div>
        `);
    })


}


})();

