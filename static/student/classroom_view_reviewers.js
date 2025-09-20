const reviewer_title = document.getElementById("reviewer_title");
const reviewer_descriptions = document.getElementById("reviewer_descriptions");
const reviewer_file = document.getElementById("reviewer_file");
const reviewer_link = document.getElementById("reviewer_link");

(async()=>{

const material_id = sessionStorage.getItem('material_id'); 

const response = await sendRequest("../api/get_student_classroom_materials", "POST", {
    'material_id' : material_id
}); 

if (response?.ok){
    const data = await response.json();

    if (data){
        document.querySelector('.classroom-section').classList.add('open');
        reviewer_title.textContent = data.material_name;
        reviewer_descriptions.textContent = data.material_description;
        if (data.material_file){
            reviewer_file.href = data.material_file;
        } else {
            reviewer_file.style.display = 'none';
        }
        if (data.material_link?.length > 0){
            reviewer_link.href = data.material_link;
            reviewer_link.textContent = data.material_link;
        } else {
            reviewer_link.style.display = 'none';
        } 

        if (data.is_joined == true){
            participate_join.style.display = 'none';
            participate_join.disabled = true;
        } else{
            participate_join.style.display = 'block';
            participate_join.disabled = false;
        }
        
    }


}
    


})();






const participate_join = document.getElementById("participate_join");
participate_join.addEventListener("click", async() => {
    

    if (participate_join.disabled) {
        return;
    }

    participate_join.disabled = true;
    showLoadingModal();
    
    const material_id = sessionStorage.getItem('material_id'); 

    const response = await sendRequest("../api/update_student_material", "POST", { 
        'material_id' : material_id
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            participate_join.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            participate_join.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal(data?.success || 'You have participated successfully.');
        setTimeout(() => {
            hideSuccessModal();
            participate_join.style.display = 'none';
            participate_join.disabled = true;
        }, 2000);
    }
});




















