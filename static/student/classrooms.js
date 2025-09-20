
const classroom_join_modal = document.getElementById("classroom_join_modal");
const classroom_link_field = document.getElementById("classroom_link"); 
const cancel_button = document.getElementById("cancel_button");
const classroom_join_button = document.getElementById("classroom_join_button");
const join_classroom_button = document.getElementById("join_classroom_button");

join_classroom_button.addEventListener("click", function() {
    classroom_join_modal.style.display = "flex";
});

cancel_button.addEventListener("click", function() {
    classroom_join_modal.style.display = "none";
});




classroom_join_button.addEventListener("click", async () => { 

    if (classroom_join_button.disabled) {
        return;
    }

    classroom_join_button.disabled = true;
    showLoadingModal('Joining classroom...');

    const response = await sendRequest("../api/join_classroom", "POST", {
        "classroom_link_id": classroom_link_field?.value, 
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            classroom_join_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            classroom_join_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Classroom joined successfully.');
        setTimeout(() => {
            window.location.reload();
            hideSuccessModal();
        }, 2000);
    }
});


const classroom_container = document.getElementById("classroom_selections");


(async()=>{

const response = await sendRequest("../api/get_student_classroom", "POST", {}); 
document.querySelector('.classroom-section').classList.add('open');

if (response?.ok){
    const data = await response.json();

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


classroom_container.addEventListener('click', function (e) {
    const target = e.target;

    // Check if the clicked element is the image
    if (target.classList.contains('classroom-icon')) {
        const classroomId = target.dataset.key; 

        sessionStorage.setItem('classroom_id', classroomId); 

        window.location.href = classroom_page;
    }
});


