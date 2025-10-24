
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
let activities = null; // {}
let activities_files = {}; // {}
let answer_sheets = {};

function generateId(){
    return Date.now().toString(36) + Math.random().toString(36).substring(2,8);
}

(async()=>{ 
const activity_id = sessionStorage.getItem('activity_id');

const response = await sendRequest("../api/student_get_activity", "POST", {
    'activity_id' : activity_id
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
        activity_certificate.textContent = activities?.is_participated ? data?.overall_certificate_name : 'Pending!';
        activity_total_score.textContent = `${data?.activity_total_scores}`;  
        activity_total_items.textContent = `${data?.activity_total_items}`;  
        activity_my_scores.textContent = `${data?.total_score}`;  
        
        const response2 = await sendRequest("../api/student_get_activity_files", "POST", {
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
    if (activities?.is_participated) { 
        const a = document.createElement('a');
        a.target = '_blank';
        a.href = `${activities.overall_certificate}`;
        document.body.appendChild(a);
        a.download = activities.overall_certificate_name;
        a.click();
        a.remove();
    }


});
 


function displayActivities(){
    if (!activities) return;
    let activity_content = activities.activity_content;
    for ( const key in activity_content ){
        answer_sheets[key] = {};

        if (activity_content[key].type == 'selection'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key}</h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5>
                    
                    <div class="classroom-activities-list-selections-container-list" id="selection${key}"> 
                    </div> 
                </div>
                
            `); 

            for (const selectionKey in activity_content[key].selections ){
                document.getElementById(`selection${key}`)?.insertAdjacentHTML(`beforeend`, `
                    <div>
                        <input type="radio" id="${selectionKey}" name="selections-item-${key}" ${ selectionKey == activity_content[key].answer_id ? 'checked' : '' } >
                        <span class="input-field poppins-light student-activitiy-input-field">${activity_content[key].selections[selectionKey]?.answer}</span>
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
                </div>
            `); 

            for (const selectionKey in activity_content[key].selections ){
                document.getElementById(`selection${key}`)?.insertAdjacentHTML(`beforeend`, `
                    <div>
                        <input id="${selectionKey}" type="checkbox" name="selections-item-${key}" ${ activity_content[key].answer_ids.includes(selectionKey) ? 'checked' : '' } >
                        <span class="input-field poppins-light student-activitiy-input-field">${activity_content[key].selections[selectionKey]?.answer}</span>
                    </div> 
                `);  
                answer_sheets[key][selectionKey] = document.getElementById(`${selectionKey}`);
            }


        } else if (activity_content[key].type == 'essay'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key} </h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5>
                    <textarea id="essay-${key}" placeholder="Put here your answer" class="poppins-regular textarea-field">${activity_content[key]?.answer ? activity_content[key]?.answer : '' }</textarea>
                </div>
            `);   
            answer_sheets[key]['essay'] = document.getElementById(`essay-${key}`);
        } else if (activity_content[key].type == 'file-submission'){
            activity_container.insertAdjacentHTML('beforeend', `
                <div class="classroom-activities-list-selections-container" style="margin-top: 12px">   
                    <h5 class="poppins-bold ellipsis">Number ${key}</h5>
                    <h5 class="poppins-regular">${activity_content[key].question}</h5> 
                    <input id="file-submission-button${key}" type="button" value="${ activity_content[key]?.answer ? activity_content[key].answer : "Click here to upload"}" class="poppins-regular file-field" style="width: 90%; margin-top: 15px;">
                    <input id="file-submission-file${key}" type="file" name="" hidden>
                </div>
            `);   
            answer_sheets[key]['file'] = document.getElementById(`file-submission-file${key}`);
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
                    <textarea id="question-file-essay${key}" placeholder="Put here your answer" class="poppins-regular textarea-field">${ activity_content[key]?.answer ? activity_content[key].answer : ""}</textarea> 
                </div>
            `);
            answer_sheets[key]['essay_file'] = document.getElementById(`question-file-essay${key}`);
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

    let prepared_data = {
    };
    let maindatas = { 
        'activity_id' : sessionStorage.getItem('activity_id')
    }
    let activity_content = activities.activity_content;

    for (const key in answer_sheets){
        prepared_data[key] = {}; 
        
        if (activity_content[key]?.type == 'selection'){
            prepared_data[key]['type'] = 'selection';
            for (const selectionKey in answer_sheets[key]){
                if (answer_sheets[key][selectionKey]?.checked){
                    
                    prepared_data[key]['answer'] = selectionKey;
                }
            }
        } else if (activity_content[key]?.type == 'multiple'){
            prepared_data[key]['type'] = 'multiple';
            prepared_data[key]['answers'] = []
            for (const selectionKey in answer_sheets[key]){
                if (answer_sheets[key][selectionKey]?.checked){
                    prepared_data[key]['answers'].push(selectionKey);
                }
            }
        } else if (activity_content[key]?.type == 'essay'){
            prepared_data[key]['type'] = 'essay';
            prepared_data[key]['answer'] = answer_sheets[key]['essay']?.value;
        } else if (activity_content[key]?.type == 'file-submission'){
            prepared_data[key]['type'] = 'file-submission';
            const generated = generateId();
            prepared_data[key]['filename'] = answer_sheets[key]['file']?.files[0]?.name || 'Student does not submit!';
            prepared_data[key]['fileKey'] = generated;
            maindatas[generated] = answer_sheets[key]['file']?.files[0]; // Add to formdata because its not working with the dictionary only
        } else if (activity_content[key]?.type == 'question-file'){
            prepared_data[key]['type'] = 'question-file';
            prepared_data[key]['answer'] = answer_sheets[key]['essay_file']?.value; 
        }
    }

    maindatas['datas'] = JSON.stringify(prepared_data);
    const response = await sendRequest('../api/student_submit_activity_files', 'POST', maindatas);

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
    if (response_data){
    // student_submit_checking_activity_files
    // "student_activity": 2
        const response2 = await sendRequest('../api/student_submit_checking_activity_files', 'POST', {
            'student_activity_id' : response_data?.student_activity
        }); 

    } 


    showSuccessModal(response_data?.success); 
    setTimeout(()=>{
        cancel_delete_material_button.click();
    }, 1000); 
    setTimeout(() => {  
        hideSuccessModal();
        window.location.reload()
    }, 2000); 
 

});
