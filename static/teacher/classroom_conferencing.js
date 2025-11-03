
const classroom_container = document.getElementById("classroom_selections");
(async()=>{

const response = await sendRequest("../api/get_teacher_classrooms", "POST", {}); 

if (response?.ok){
    const data = await response.json();

    document.querySelector('.classroom-section').classList.add('open');

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


classroom_container.addEventListener("click", function(event){
    const button = event?.target?.closest("img");
    if (!button) return;
    const key = button?.dataset?.key;
    if (!key) return;

    console.log(key)


    sessionStorage.setItem("classroom_meeting", key);
    window.location.href = link_start_video_conferencing;
});

