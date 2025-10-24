
const classroom_section = document.getElementById("classroom_section");
const material_participants = document.getElementById("material_participants"); 
const activity_container = document.getElementById("activity_container"); 
   

const activity_title = document.getElementById("activity_title");
const activity_descriptions = document.getElementById("activity_descriptions");
const activity_type = document.getElementById("activity_type"); 
const activity_due = document.getElementById("activity_due");
const activity_certificate = document.getElementById("activity_certificate");
const activity_total_score = document.getElementById("activity_total_score"); 
const activity_total_items = document.getElementById("activity_total_items"); 
const activity_my_scores = document.getElementById("activity_my_scores"); 
const student_name_text = document.getElementById("student_name_text"); 
let activities = null; // {}
let activities_files = {}; // {}
let answer_sheets = {};
let scores_holder = {}; 
let total_score = 0;

function generateId(){
    return Date.now().toString(36) + Math.random().toString(36).substring(2,8);
}

(async()=>{ 
const activity_id = sessionStorage.getItem('activity_id');
const student_id = sessionStorage.getItem('student_id');

const response = await sendRequest("../api/teacher_get_student_activity", "POST", {
    'activity_id' : activity_id,
    'student_id' : student_id
}); 

if (response?.ok){
    const data = await response.json();
    activities = data;

    if (data){ 
        
        if (activities?.is_participated){
            submit_opener.disabled = true;
            submit_opener.style.display = 'none';
        }

        classroom_section.classList.add('open');
        student_name_text.textContent = `${data?.student_name} (Answer Sheet)`
        activity_title.textContent = data?.activity_name;
        activity_descriptions.textContent = data?.activity_description;
        activity_type.textContent = data?.activity_type;

 
        const activity_due_date = new Date(data.activity_due_date);
 
        activity_due.textContent = activity_due_date.toLocaleString( 'en-US' , {
            month : 'long',
            day : 'numeric',
            year : 'numeric',
            hour : 'numeric',
            minute : 'numeric'
        });
        activity_certificate.textContent = data?.overall_certificate_name ;
        activity_total_score.textContent = `${data?.activity_total_scores}`;  
        activity_total_items.textContent = `${data?.activity_total_items}`;  
        activity_my_scores.textContent = `${data?.total_score}`;  
        total_score = data?.total_score;
        
        const response2 = await sendRequest("../api/teacher_get_student_activity_files", "POST", {
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

 

activity_certificate.addEventListener('click', ()=>{ 
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = `${activities.overall_certificate}`;
    document.body.appendChild(a);
    a.download = activities.overall_certificate_name;
    a.click();
    a.remove();   
});
 


function displayActivities(){
    if (!activities) return;
    let activity_content = activities.activity_content;
    for ( const key in activity_content ){
        answer_sheets[key] = {};
        scores_holder[key] = {};

        if (activity_content[key].type == 'selection'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key}</h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5> 
                    <div class="classroom-activities-list-selections-container-list" id="selection${key}"> 
                    </div> 
                    <input value="${activity_content[key]?.score || '0'}" id="score${key}" type="number" placeholder="Score" class="poppins-semibold input-field activity-score-input" >
                </div>
                
            `); 
            scores_holder[key]['score'] = document.getElementById(`score${key}`);
            for (const selectionKey in activity_content[key].selections ){
                document.getElementById(`selection${key}`)?.insertAdjacentHTML(`beforeend`, `
                    <div>
                        <input type="radio" id="${selectionKey}" name="selections-item-${key}" ${ selectionKey == activity_content[key].answer_id ? 'checked' : '' } >
                        <span class="input-field poppins-light student-activitiy-input-field">${activity_content[key].selections[selectionKey]?.answer}"</span>
                    </div>
                `);
                answer_sheets[key][selectionKey] = document.getElementById(`${selectionKey}`); 
            }

        } else if (activity_content[key].type == 'multiple'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key} </h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5>
                    
                    <div class="classroom-activities-list-selections-container-list" id="selection${key}"> 
                    </div> 
                    <input value="${activity_content[key]?.score || '0'}" id="score${key}" type="number" placeholder="Score" class="poppins-semibold input-field activity-score-input" >
                </div>
            `); 
            scores_holder[key]['score'] = document.getElementById(`score${key}`);

            for (const selectionKey in activity_content[key].selections ){
                document.getElementById(`selection${key}`)?.insertAdjacentHTML(`beforeend`, `
                    <div>
                        <input id="${selectionKey}" type="checkbox" name="selections-item-${key}" ${ activity_content[key].answer_ids.includes(selectionKey) ? 'checked' : '' } >
                        <span class="input-field poppins-light student-activitiy-input-field">${activity_content[key].selections[selectionKey]?.answer}"</span>
                    </div> 
                `);  
                answer_sheets[key][selectionKey] = document.getElementById(`${selectionKey}`);
            }


        } else if (activity_content[key].type == 'essay'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key} </h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5>
                    <textarea id="essay-${key}" readonly placeholder="Put here your answer" class="poppins-regular textarea-field">${activity_content[key]?.answer ? activity_content[key]?.answer : '' }</textarea>
                    <input value="${activity_content[key]?.score || '0'}" id="score${key}" type="number" placeholder="Score" class="poppins-semibold input-field activity-score-input" >    
                </div>
            `);    
            scores_holder[key]['score'] = document.getElementById(`score${key}`);
            answer_sheets[key]['essay'] = document.getElementById(`essay-${key}`);
        } else if (activity_content[key].type == 'file-submission'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key}</h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5> 
                    <input id="file-submission-button${key}" type="button" value="${ activity_content[key]?.answer ? activity_content[key].answer : "Click here to upload"}" class="poppins-regular file-field" style="width: 90%; margin-top: 15px;">
                    <input id="file-submission-file${key}" type="file" name="" hidden>
                    <input value="${activity_content[key]?.score || '0'}" id="score${key}" type="number" placeholder="Score" class="poppins-semibold input-field activity-score-input" >    
                </div>
            `);   
            answer_sheets[key]['file'] = document.getElementById(`file-submission-file${key}`);
            scores_holder[key]['score'] = document.getElementById(`score${key}`);
            document.getElementById(`file-submission-button${key}`).addEventListener('click', async()=>{ 
                document.getElementById(`file-submission-file${key}`).click();
            });
            document.getElementById(`file-submission-file${key}`).addEventListener('change', ()=>{
                document.getElementById(`file-submission-button${key}`).value = document.getElementById(`file-submission-file${key}`).files[0].name;
            });

        } else if (activity_content[key].type == 'question-file'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key}</h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5> 
                    <input type="button" id="question-file${key}" value="${activity_content[key].filename}" class="poppins-regular file-field" style="width: 90%;">
                    <textarea readonly id="question-file-essay${key}" placeholder="Put here your answer" class="poppins-regular textarea-field">${ activity_content[key]?.answer ? activity_content[key].answer : ""}</textarea> 
                    <input value="${activity_content[key]?.score || '0'}" id="score${key}" type="number" placeholder="Score" class="poppins-semibold input-field activity-score-input" >        
                </div>
            `);
            answer_sheets[key]['essay_file'] = document.getElementById(`question-file-essay${key}`);
            scores_holder[key]['score'] = document.getElementById(`score${key}`);
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



const delete_material_modal = document.getElementById("delete_material_modal");
const continue_delete_material_button = document.getElementById("continue_delete_material_button");
const cancel_delete_material_button = document.getElementById("cancel_delete_material_button"); 
const submit_opener = document.getElementById('submit-opener');
const calculate_score = document.getElementById('calculate_score');


calculate_score.addEventListener('click', ()=>{
    calculate_score.textContent = 'Calculating . . .';
    total_score = 0;
    for (const key in scores_holder){
        const input_score = scores_holder[key].score?.value || '0';
        let score = parseInt(input_score);
        total_score += score;
    }

    activity_my_scores.textContent = `${total_score}`;

    setTimeout(()=>{
        calculate_score.textContent = 'Calculate Score';
    }, 800);
    
});



submit_opener.addEventListener('click', ()=>{
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
    showLoadingModal('Submitting Activities'); 

    let maindatas = { 
        'activity_id' : sessionStorage.getItem('activity_id'),
        'total_score' : total_score,
        'student_id' : sessionStorage.getItem('student_id')
    }  
    let prepared_data = {};
    for (const key in answer_sheets){ 
        
        const input_score = scores_holder[key].score?.value || '0';
        let score = parseInt(input_score);
        prepared_data[key] = score; 
    }

    maindatas['datas'] = JSON.stringify(prepared_data);
    const response = await sendRequest('../api/teacher_check_student_activity', 'POST', maindatas);

    hideLoadingModal();
    if (!response){ 
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            continue_delete_material_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // Todo: show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            continue_delete_material_button.disabled = false;
        }, 2000); 
        return;
    }

    const response_data = await response.json();
  
    showSuccessModal(response_data?.success); 
    setTimeout(()=>{
        cancel_delete_material_button.click();
    }, 1000); 
    setTimeout(() => {  
        hideSuccessModal();
        window.location.reload()
    }, 2000); 
 

});






document.getElementById('back_button').addEventListener('click', ()=>{
    const came_from = sessionStorage.getItem('came_from')
    console.log(came_from);
    if (came_from){
        window.location.href = came_from
    }
})