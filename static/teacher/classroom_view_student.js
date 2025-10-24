

(async()=>{

const material_collections = document.getElementById("material_collections");


const classroom_id = sessionStorage.getItem('classroom_id');
const student = sessionStorage.getItem('student'); 
sessionStorage.setItem('student_id', student)

const response = await sendRequest("../api/teacher_check_student", "POST", {
    'classroom_id' : classroom_id,
    'student_id' : student,
}); 

if (response?.ok){
    const data = await response.json();

    if (data){
        document.querySelector('.classroom-section').classList.add('open'); 
        document.getElementById("profile").src = data?.student?.profile;
        document.getElementById("student_name").textContent = data?.student?.name;
        document.getElementById("school_name").textContent = data?.student?.school_name;
        document.getElementById("grade_level").textContent = data?.student?.grade_level;  

        const submitted_data = data?.datas;
        if (submitted_data?.length < 1){
            material_collections.insertAdjacentHTML('beforeend',` 
                <div class="material-empty">
                    <h3 class="poppins-light"> There are no activities or reviewer student submitted/participated </h3>
                </div> 
            `);
            return;
        }

        submitted_data.forEach(element => {
            
            material_collections.insertAdjacentHTML('beforeend',`  
                <div class="student-material-container">
                    <img src="${ element?.submitted ? check_activity : uncheck_activity }" alt=""> 
                    <h1 class="poppins-regular ellipsis">${element?.name}</h1>
                    <h2 class="poppins-light ellipsis">Date Uploaded : ${element?.date}</h2> 
                    <span class="collection-category poppins-black">
                        ${element?.type}
                    </span>
                    <button class="poppins-light collection-visit-button" style="display : ${ element?.type == 'Material' ? 'none' : 'block'}" data-key="${element?.id}" >
                        Click here to view
                    </button> 
                </div>
            `);
        });
    }


}
    


})();





material_collections.addEventListener('click', function(event){
    const selected = event.target.closest('.collection-visit-button');
    if (!selected) return;
    const activity = selected?.dataset?.key;
    console.log(activity)
    if (!activity) return; 
    sessionStorage.setItem('came_from', page_link);
    sessionStorage.setItem('activity_id', activity);
    window.location.href = clasrroms_activity_student_page_link;


});
