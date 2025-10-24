
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


})();

 

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


const classroom_add_activities_modal = document.getElementById("classroom_add_activities_modal");
const cancel_activity_button = document.getElementById("cancel_activity_button");
const continue_activity_button = document.getElementById("continue_activity_button");
const add_collection_button = document.getElementById("add_collection_button");
 
add_collection_button.addEventListener("click", function() {
    classroom_add_activities_modal.style.display = "flex";
});

cancel_activity_button.addEventListener("click", function() {
    classroom_add_activities_modal.style.display = "none";
});



const monthField = document.getElementById('month-field'); 
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

let activities = {}

async function get_classroom_materials(){
    const classroom_id = sessionStorage.getItem('classroom_id');


    const response = await sendRequest("../api/teacher_activities", "POST", {
        'classroom_id' : classroom_id,
        'selected_month' : monthField.value
    }); 

    if (response?.ok){
        const data = await response.json();

        material_collections.innerHTML = '';

        if (data){
            
            if (data?.activities?.length == 0){
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-empty" >
                        <h3 class="poppins-light"> There are no activities uploaded this month! </h3>
                    </div>
                `);
                return;
            }
            
            data.activities.forEach((activity) => {
                activities[activity.id] = activity; 
                const activity_starting_date = new Date(activity.activity_starting_date); 
                const activity_due_date = new Date(activity.activity_due_date); 
                material_collections.insertAdjacentHTML("beforeend", `   
                    <div class="material-container" >
                        <img src="${delete_material_icon}" alt="" data-action="delete" data-material-id="${activity?.id}" class="collections-delete-button">
                        <h2 class="poppins-regular ellipsis"> ${activity?.activity_name} </h2>
                        <h5 class="poppins-light ellipsis">Date Uploaded : ${activity.activity_starting_date ? activity_starting_date.toLocaleString( 'en-US' , {
                            month : 'long',
                            day : 'numeric',
                            year : 'numeric',
                            hour : 'numeric',
                            minute : 'numeric'
                        }) : 'Not assigned'}</h5>
                        <h5 class="poppins-light ellipsis">Date Submission : ${activity.activity_due_date ? activity_due_date.toLocaleString('en-US' , {
                            month : 'long',
                            day : 'numeric',
                            year : 'numeric',
                            hour : 'numeric',
                            minute : 'numeric'
                        }) : 'Not assigned'}</h5>
                        <button class="poppins-light collection-visit-button" data-action="view" data-material-id="${activity?.id}">
                            Click here to view
                        </button>

                        <span class="collection-category poppins-black">
                            ${activity?.activity_type}
                        </span>
                    </div>
                `);
            })    
        }
    }


};

monthField.addEventListener('change', () => {
    get_classroom_materials();
});

get_classroom_materials();



material_collections.addEventListener('click', function (e) {
    const target = e.target;
    const action = target.dataset.action;
    const activityId = target.dataset.materialId;
    console.log(`Action: ${action}, Activity ID: ${activityId}`);
    if (action && activityId) {
        

        // You can branch logic here
        if (action === 'delete') {
            // Handle delete
            delete_material_modal.style.display = "flex";
            selected_activity_id = parseInt(activityId);
        } else if (action === 'view') {
            // Handle view
            sessionStorage.setItem('activity_id', activityId);
            window.location.href = classroom_view_activities;
        }
    }
});




var selected_activity_id = null; 
const delete_material_modal = document.getElementById("delete_material_modal");
const continue_delete_material_button = document.getElementById("continue_delete_material_button");
const cancel_delete_material_button = document.getElementById("cancel_delete_material_button"); 

cancel_delete_material_button.addEventListener("click", function() {
    delete_material_modal.style.display = "none";
    selected_activity_id = null;
});


continue_delete_material_button.addEventListener("click", async () => {

    if (continue_delete_material_button.disabled) {
        return;
    }

    continue_delete_material_button.disabled = true;
    showLoadingModal();
     
    const response = await sendRequest("../api/teacher_delete_activity", "POST", {
        'activity_id' : selected_activity_id, 
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            continue_delete_material_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            continue_delete_material_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Activity deleted successfully.');
        get_classroom_materials();
        setTimeout(() => {  
            delete_material_modal.style.display = "none";
            continue_delete_material_button.disabled = false;
            hideSuccessModal();
        }, 2000);
    }
});

function generateId(){
    return Date.now().toString(36) + Math.random().toString(36).substring(2,8);
}


const classroom_activities_list_container = document.getElementById("classroom_activities_list_container");
classroom_activities_list_container.innerHTML = '';
let questionaires = {} // Contain the selected questionaries

const classroom_activities_list_of_actions = document.getElementById("classroom_activities_list_of_actions");
classroom_activities_list_of_actions.addEventListener('click', function(event){
    const button = event.target?.closest('button');
    const activity_action = button?.dataset?.action;
    if (!activity_action) return;

    const id = generateId();
    
    if (activity_action == '1'){
        classroom_activities_list_container.insertAdjacentHTML('beforeend', ` 
            <div class="classroom-activities-list-selections-container" id="holder_${id}">  
                <h5 class="poppins-regular"> Provide the question below in the textbox</h5>
                <textarea id="textarea_${id}" name="description" placeholder="What is the questions" class="poppins-regular textarea-field"></textarea>
                
                <h5 class="poppins-regular">Provide the selection below and check the box if its the correct answer</h5>
                <div class="classroom-activities-list-selections-container-list" id="selection_${id}">

                </div>

                <div class="classroom-activities-actions">
                    <button data-action="add" data-owner="${id}" id="add_${id}" class="poppins-semibold">Add Selection</button>
                    <button data-action="remove" data-owner="${id}" id="remove_${id}" style="background-color: #eb3235;"  class="poppins-semibold">Remove Selection</button>
                    <button data-action="delete" data-owner="${id}" id="delete_${id}" style="background-color: #FA191C;" class="poppins-semibold">Delete This Questions</button>
                </div>
                <div class="divider"></div>
            </div> 
        `)
        questionaires[id] = {
            'type' : '1',
            'holder' : document.getElementById(`holder_${id}`),
            'question' : document.getElementById(`textarea_${id}`),
            'selections' : document.getElementById(`selection_${id}`), 
            'selections_list' : [], 
        }
        return;
    }

    if (activity_action == '2'){
        classroom_activities_list_container.insertAdjacentHTML('beforeend', `   
            <div class="classroom-activities-list-selections-container" id="holder_${id}">  
                <h5 class="poppins-regular"> Provide the question below in the textbox</h5>
                <textarea id="textarea_${id}" name="description" placeholder="What is the questions" class="poppins-regular textarea-field"></textarea>
                
                <h5 class="poppins-regular">Provide the selection below and check the box if its the correct answer</h5>
                <div class="classroom-activities-list-selections-container-list" id="selection_${id}" > 
                </div>

                <div class="classroom-activities-actions">
                    <button data-action="add" data-owner="${id}" id="add_${id}" class="poppins-semibold">Add Selection</button>
                    <button data-action="remove" data-owner="${id}" id="remove_${id}" style="background-color: #eb3235;"  class="poppins-semibold">Remove Selection</button>
                    <button data-action="delete" data-owner="${id}" id="delete_${id}" style="background-color: #FA191C;" class="poppins-semibold">Delete This Questions</button>
                </div>
                <div class="divider"></div>
            </div>
        `)
        
        questionaires[id] = {
            'type' : '2',
            'holder' : document.getElementById(`holder_${id}`),
            'question' : document.getElementById(`textarea_${id}`),
            'selections' : document.getElementById(`selection_${id}`),
            'selections_list' : [], 
        }
    }
 
    if (activity_action == '3'){
        classroom_activities_list_container.insertAdjacentHTML('beforeend', `   
            <div class="classroom-activities-list-selections-container" id="holder_${id}">  
                <h5 class="poppins-regular"> Provide the question below in the textbox</h5>
                <textarea id="textarea_${id}" name="description" placeholder="What is the questions" class="poppins-regular textarea-field"></textarea>
                
                <div class="classroom-activities-actions">
                    <button data-action="delete" data-owner="${id}" id="delete_${id}" style="background-color: #FA191C;" class="poppins-semibold">Delete This Questions</button>
                </div>
                <div class="divider"></div>
            </div>
        `)
        
        questionaires[id] = {
            'type' : '3',
            'holder' : document.getElementById(`holder_${id}`),
            'question' : document.getElementById(`textarea_${id}`),
        }
    }
    if (activity_action == '4'){
        classroom_activities_list_container.insertAdjacentHTML('beforeend', `
            <div class="classroom-activities-list-selections-container" id="holder_${id}">  
                <h5 class="poppins-regular"> Provide the question below in the textbox for uploading file</h5>
                <textarea id="textarea_${id}" name="description" placeholder="What is the questions" class="poppins-regular textarea-field"></textarea>
                
                <div class="classroom-activities-actions">
                    <button data-action="delete" data-owner="${id}" id="delete_${id}" style="background-color: #FA191C;" class="poppins-semibold">Delete This Questions</button>
                </div>
                <div class="divider"></div>
            </div>
        `)
        
        questionaires[id] = {
            'type' : '4',
            'holder' : document.getElementById(`holder_${id}`),
            'question' : document.getElementById(`textarea_${id}`),
        }
    }
    if (activity_action == '5'){
        classroom_activities_list_container.insertAdjacentHTML('beforeend', ` 
            <div class="classroom-activities-list-selections-container" id="holder_${id}"> 
                <h5 class="poppins-regular"> Provide the question below in the textbox</h5>
                <textarea id="textarea_${id}" name="description" placeholder="What is the questions" class="poppins-regular textarea-field"></textarea>
                <input data-action="upload" data-owner="${id}" id="upload_${id}" type="button" value="Click here to upload file" placeholder="Enter Your Activity Name" class="poppins-regular file-field ellipsis">
                <input type="file" id="file_${id}" hidden>

                <div class="classroom-activities-actions">
                    <button data-action="delete" data-owner="${id}" id="delete_${id}" style="background-color: #FA191C;" class="poppins-semibold">Delete This Questions</button>
                </div>
                <div class="divider"></div>
            </div>
        `)
        
        questionaires[id] = {
            'type' : '5',
            'holder' : document.getElementById(`holder_${id}`),
            'question' : document.getElementById(`textarea_${id}`),
            'file' : document.getElementById(`file_${id}`), 
            'button' : document.getElementById(`upload_${id}`), 
            'has_event_listener' : false,
            'base64' : ''
        }
    }
 
})



classroom_activities_list_container.addEventListener('click', function(event){
    
    const owner = event.target.dataset?.owner;
    const action = event.target.dataset?.action;

    if (!owner && !action) return;

    const owner_data = questionaires[owner];
    if (!owner_data) return;

    
    if (owner_data?.type == '5'){
        // + Selections items 
        if ( action == 'delete' ){
            owner_data.holder.remove();
            delete questionaires[owner]; 
        } else if (action == "upload"){
            owner_data.file.click()
            if (!owner_data.has_event_listener){
                owner_data.file.addEventListener("change", () => {  
                    owner_data.button.value = owner_data.file.files[0].name;
                    owner_data['base64'] = owner_data.file.files[0]
                });
                owner_data.has_event_listener = true;
            } 
        }
        return;
    }

    if (owner_data?.type == '4'){
        // + Selections items 
        if ( action == 'delete' ){
            owner_data.holder.remove();
            delete questionaires[owner]; 
        } 
        return;
    }

    if (owner_data?.type == '3'){
        // + Selections items 
        if ( action == 'delete' ){
            owner_data.holder.remove();
            delete questionaires[owner]; 
        } 
        return;
    }
    
    if (owner_data?.type == '2'){
        // + Selections items 
        if(action == 'add'){
            const item_id = generateId();
            owner_data?.selections.insertAdjacentHTML('beforeend', ` 
                <div id="selection_div_${owner}_${item_id}">
                    <input type="checkbox" name="item_${owner}" id="item_${owner}_${item_id}">
                    <input type="text" class="input-field poppins-light" id="${item_id}">
                </div>
            `);
            questionaires[owner].selections_list.push({
                'div' : document.getElementById(`selection_div_${owner}_${item_id}`),
                'checkbox' : document.getElementById(`item_${owner}_${item_id}`),
                'input' : document.getElementById(`${item_id}`),
            })
        } else if ( action == 'remove'){ 
            if (questionaires[owner].selections_list.length == 0) return;

            const last_selection = questionaires[owner].selections_list.pop();
            last_selection?.div?.remove(); 
        } else if ( action == 'delete' ){
            owner_data.holder.remove();
            delete questionaires[owner]; 
        } 
        return;
    }

    if (owner_data?.type == '1'){
        // + Selections items 
        if(action == 'add'){
            const item_id = generateId();
            owner_data?.selections.insertAdjacentHTML('beforeend', ` 
                <div id="selection_div_${owner}_${item_id}">
                    <input type="radio" name="item_${owner}" id="item_${owner}_${item_id}">
                    <input type="text" class="input-field poppins-light" id="${item_id}">
                </div>
            `);
            questionaires[owner].selections_list.push({
                'div' : document.getElementById(`selection_div_${owner}_${item_id}`),
                'radio' : document.getElementById(`item_${owner}_${item_id}`),
                'input' : document.getElementById(`${item_id}`),
            })
        } else if ( action == 'remove'){ 
            if (questionaires[owner].selections_list.length == 0) return;

            const last_selection = questionaires[owner].selections_list.pop();
            last_selection?.div?.remove(); 
        } else if ( action == 'delete' ){
            owner_data.holder.remove();
            delete questionaires[owner]; 
        } 
        return;
    }


});

const activity_name = document.getElementById("activity_name");
const activity_descriptions = document.getElementById("activity_descriptions");
const activity_classfications = document.getElementById("activity_classfications");
const activity_starting_date = document.getElementById("activity_starting_date");
const activity_starting_time = document.getElementById("activity_starting_time");
const activity_deadline_date = document.getElementById("activity_deadline_date");
const activity_deadline_time = document.getElementById("activity_deadline_time");
const activity_overall_certificate = document.getElementById("activity_overall_certificate");
const activity_overall_certificate_file = document.getElementById("activity_overall_certificate_file");
const activity_total_scores = document.getElementById("activity_total_scores");


activity_overall_certificate.addEventListener('click', ()=>{
    activity_overall_certificate_file.click();
})

activity_overall_certificate_file.addEventListener('change', async function(event) {
    activity_overall_certificate.value = activity_overall_certificate_file.files[0].name;   
})
 
continue_activity_button.addEventListener('click', async()=>{
    if(continue_activity_button.disabled) return;
    continue_activity_button.disabled = true;

    showLoadingModal('Uploading Activities'); 
    let maindatas = { 
        'activity_name' : activity_name?.value,
        'activity_description' : activity_descriptions?.value,
        'activity_type' : activity_classfications?.value,
        'activity_starting_date' : activity_starting_date?.value,
        'activity_starting_time' : activity_starting_time?.value,
        'activity_deadline_date' : activity_deadline_date?.value,
        'activity_deadline_time' : activity_deadline_time?.value, 
        'activity_total_scores' : activity_total_scores.value,
        'classroom_id' : sessionStorage.getItem('classroom_id') 
    };

    for (const key in maindatas){
        if (maindatas[key] == ''){
            showErrorModal('Fill up the form! Fill it properly');
            setTimeout(() => {
                hideErrorModal();
                continue_activity_button.disabled = false;
            }, 1500);
            return;
        }
    }

    maindatas['activity_overall_certificate_file'] =  activity_overall_certificate_file?.files[0] || null; 
    maindatas['overall_certificate_name'] =  activity_overall_certificate_file?.files[0].name || 'No File Uploaded';
    let datas = {};
    let index = 1;

    for (const key in questionaires){
        if (questionaires[key].type == '1'){
            datas[index] = {
                'type' : 'selection',
                'question' : questionaires[key].question.value,
                'selections' : {},
                'answer_id' : ''
            };

            questionaires[key].selections_list.forEach((selection)=>{
                const selection_id = generateId();
                datas[index].selections[selection_id] = {
                    // 'checked' : selection.radio.checked,
                    'answer' : selection.input.value,
                }
                if (selection.radio.checked){
                    datas[index].answer_id = selection_id;
                }
            })  
        } else if ( questionaires[key].type == '2' ){
            datas[index] = {
                'type' : 'multiple',
                'question' : questionaires[key].question.value,
                'selections' : {},
                'answer_ids' : []
            };

            questionaires[key].selections_list.forEach((selection)=>{
                const selection_id = generateId();
                datas[index].selections[selection_id] = {
                    // 'checked' : selection.checkbox.checked,
                    'answer' : selection.input.value,
                }
                if (selection.checkbox.checked){
                    datas[index].answer_ids.push(selection_id);
                }
            })   
        } else if (questionaires[key].type == '3'){
            datas[index] = {
                'type' : 'essay',
                'question' : questionaires[key].question.value,
            };
        } else if (questionaires[key].type == '4'){
            datas[index] = {
                'type' : 'file-submission',
                'question' : questionaires[key].question.value,
            };
        } else if (questionaires[key].type == '5'){
            const fileKey = generateId();
            datas[index] = {
                'type' : 'question-file',
                'question' : questionaires[key].question.value,
                'fileKey' : fileKey,
                'filename' : questionaires[key]?.button?.value
            };
            maindatas[fileKey] = questionaires[key]['base64'];
        } 
        index = index + 1;
    }

    maindatas['datas'] = JSON.stringify(datas);


    const response = await sendRequest('../api/teacher_add_activity', 'POST', maindatas);
    hideLoadingModal();
    if (!response){
        // Todo: show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            continue_activity_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // Todo: show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            continue_activity_button.disabled = false;
        }, 2000); 
        return;
    } 
    const response_data = await response.json();
    if (response_data){
        showSuccessModal(response_data?.success);
        get_classroom_materials();
        setTimeout(()=>{
            cancel_activity_button.click();
        }, 1000); 
        setTimeout(() => { 
            questionaires = {}
            classroom_activities_list_container.innerHTML = '';


            activity_name.value = '';
            activity_descriptions.value = '';
            activity_classfications.value = 'Assignment';
            activity_starting_date.value = '';
            activity_starting_time.value = '';
            activity_deadline_date.value = '';
            activity_deadline_time.value = ''; 
            activity_total_scores.value = '';
            activity_overall_certificate_file.files = null; 
            activity_overall_certificate_file.value = null;
            activity_overall_certificate.value = 'Click here to upload certificate';

            hideSuccessModal();
            continue_activity_button.disabled = false;
        }, 2000); 
    }
    
 
});




