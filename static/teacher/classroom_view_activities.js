
const classroom_section = document.getElementById("classroom_section");
const material_participants = document.getElementById("material_participants");
const participant_button = document.getElementById("participant_button");
const activity_button = document.getElementById("activity_button");
const participant_container = document.getElementById("participant_container");
const activity_container = document.getElementById("activity_container");

participant_button.addEventListener('click' , ()=>{
    activity_container.style.display = 'none';
    participant_container.style.display = 'flex';
    participant_button.style.opacity = 1;
    activity_button.style.opacity = 0.6;
});
 
activity_button.addEventListener('click' , ()=>{
    participant_container.style.display = 'none';
    activity_container.style.display = 'flex';
    activity_button.style.opacity = 1;
    participant_button.style.opacity = 0.6;
});

const editable_opener = document.getElementById("editable_opener");

const activity_title = document.getElementById("activity_title");
const activity_descriptions = document.getElementById("activity_descriptions");
const activity_type = document.getElementById("activity_type");
const activity_release = document.getElementById("activity_release");
const activity_due = document.getElementById("activity_due");
const activity_certificate = document.getElementById("activity_certificate");
const activity_total_score = document.getElementById("activity_total_score"); 
const activity_total_items = document.getElementById("activity_total_items"); 
let activities = null; // {}
let activities_files = {}; // {}


(async()=>{ 
const activity_id = sessionStorage.getItem('activity_id');

const response = await sendRequest("../api/teacher_get_activity", "POST", {
    'activity_id' : activity_id
}); 

if (response?.ok){
    const data = await response.json();
    activities = data;

    if (data){ 
        classroom_section.classList.add('open');
        activity_title.textContent = data?.activity_name;
        activity_descriptions.textContent = data?.activity_description;
        activity_type.textContent = data?.activity_type;

        const activity_starting_date = new Date(data.activity_starting_date); 
        const activity_due_date = new Date(data.activity_due_date);

        activity_release.textContent = activity_starting_date.toLocaleString( 'en-US' , {
            month : 'long',
            day : 'numeric',
            year : 'numeric',
            hour : 'numeric',
            minute : 'numeric'
        });
        activity_due.textContent = activity_due_date.toLocaleString( 'en-US' , {
            month : 'long',
            day : 'numeric',
            year : 'numeric',
            hour : 'numeric',
            minute : 'numeric'
        });
        activity_certificate.textContent = data?.overall_certificate_name;
        activity_total_score.textContent = `${data?.activity_total_scores}`;  
        activity_total_items.textContent = `${data?.activity_total_items}`;  
        
        // if (data?.is_editable){
        //     NOT NECESSARY IMPLEMENTATION
        //     editable_opener.style.display = 'flex'; 
        // }

        
        const response2 = await sendRequest("../api/teacher_get_activity_files", "POST", {
            'activity_id' : activity_id
        });

        if (response2?.ok){
            const data2 = await response2.json(); 
            data2?.data.forEach(file =>{ 
                activities_files[file?.activity_custom_id] = file;
            })
        }

        displayActivities();
    }
}

})();




(async()=>{ 
const activity_id = sessionStorage.getItem('activity_id');

const response = await sendRequest("../api/teacher_get_activity_joined", "POST", {
    'activity_id' : activity_id
}); 

if (response?.ok){
    const data = await response.json();

    if (data){ 

        material_participants.innerHTML = '';
        if (data.students?.length == 0){
            material_participants.insertAdjacentHTML('beforeend', ` 
                <div class="no-paticipant" >
                    <h6 class="poppins-light">There is no participant on this activities.</h6>
                </div>
            `);
            return;
        }

        data.students.forEach((student) => {
            material_participants.insertAdjacentHTML('beforeend', ` 
            <div class="participant-container" style="cursor:pointer;" data-student="${student.id}">
                <img src="${student.profile_image}" alt="">
                <div class="participant-info" >
                    <h4 class="poppins-regular ellipsis">${ student.checked ? "(CHECKED) " : ''}${student.fullname}</h4>
                    <h5 class="poppins-light ellipsis">${student.checked ? "Click here to reviewed" : "Click here to check answer"}</h5>
                </div>
            </div>     
            `);
        })
    }
}


})();


activity_certificate.addEventListener('click', ()=>{ 
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${activities.overall_certificate}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
});
 

function displayActivities(){
    if (!activities) return;
    let activity_content = activities.activity_content;
    for ( const key in activity_content ){

        if (activity_content[key].type == 'selection'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-medium ellipsis">Number ${key} (+ Selections items)</h5>
                    <textarea readonly class="poppins-regular textarea-field">${activity_content[key].question}</textarea>
                    
                    <div class="classroom-activities-list-selections-container-list" id="selection${key}"> 
                    </div> 
                </div>
            `); 

            for (const selectionKey in activity_content[key].selections ){
                document.getElementById(`selection${key}`)?.insertAdjacentHTML(`beforeend`, `
                    <div>
                        <input type="radio" name="selections-item-${key}" disabled ${ selectionKey == activity_content[key].answer_id ? 'checked' : '' } >
                        <input type="text" class="input-field poppins-light" readonly value="${activity_content[key].selections[selectionKey]?.answer}">
                    </div> 
                `);  
            }
        } else if (activity_content[key].type == 'multiple'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-medium ellipsis">Number ${key} (+ Multiple selections)</h5>
                    <textarea readonly class="poppins-regular textarea-field">${activity_content[key].question}</textarea>
                    
                    <div class="classroom-activities-list-selections-container-list" id="selection${key}"> 
                    </div> 
                </div>
            `); 

            for (const selectionKey in activity_content[key].selections ){
                document.getElementById(`selection${key}`)?.insertAdjacentHTML(`beforeend`, `
                    <div>
                        <input type="checkbox" name="selections-item-${key}" disabled ${ activity_content[key].answer_ids.includes(selectionKey) ? 'checked' : '' } >
                        <input type="text" class="input-field poppins-light" readonly value="${activity_content[key].selections[selectionKey]?.answer}">
                    </div> 
                `);  
            }


        } else if (activity_content[key].type == 'essay'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-medium ellipsis">Number ${key} (+ Question for essay)</h5>
                    <textarea readonly class="poppins-regular textarea-field">${activity_content[key].question}</textarea>
                     
                </div>
            `);   
        } else if (activity_content[key].type == 'file-submission'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-medium ellipsis">Number ${key} (+ Question for file submission)</h5>
                    <textarea readonly class="poppins-regular textarea-field">${activity_content[key].question}</textarea>
                </div>
            `);   
        } else if (activity_content[key].type == 'question-file'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-medium ellipsis">Number ${key} (+ Question with file)</h5>
                    <textarea readonly class="poppins-regular textarea-field">${activity_content[key].question}</textarea>
                    <input type="button" id="question-file${key}" value="${activity_content[key].filename}" class="poppins-regular file-field" style="width: 90%;">
                </div>
            `);
            document.getElementById(`question-file${key}`).addEventListener('click', async()=>{
                // Create a temporary <a> element to trigger download
                
                let fileURL = activities_files[activity_content[key]?.fileKey]?.activity_file; 
                if (!fileURL) return;

                const a = document.createElement('a');
                a.target = '_blank';
                a.href = `../media/${fileURL}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
        } 

    }
    
}



function displayEditActivities(){
    if (!activities) return;
    let activity_content = activities.activity_content;
    
    for ( const key in activity_content ){



    }

}





material_participants.addEventListener('click', function(event){
    const selected = event.target.closest('.participant-container');
    if (!selected) return;
    const studentId = selected?.dataset?.student;
    console.log(studentId)
    if (!studentId) return;

    sessionStorage.setItem('came_from', page_link);
    sessionStorage.setItem('student_id', studentId);
    window.location.href = clasrroms_activity_student_page_link;


});



