


const classroom_name_tag = document.getElementById("classroom_name_tag");
const classroom_subject_tag = document.getElementById("classroom_subject_tag");
const classroom_link_id = document.getElementById("classroom_link_id");
const copy_link_button = document.getElementById("copy_link_button");


const classroom_name = document.getElementById("classroom_name");
const classroom_subject = document.getElementById("classroom_subject");
const classroom_description = document.getElementById("classroom_description");


const monthField = document.getElementById('month-field');




copy_link_button.addEventListener("click", () => {
    navigator.clipboard.writeText(classroom_link_id.innerHTML);
});

const material_collections = document.getElementById("material_collections");

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

let materials = {}



async function get_classroom_materials(){
    const classroom_id = sessionStorage.getItem('classroom_id');


    const response = await sendRequest("../api/get_teacher_classroom_materials", "POST", {
        'classroom_id' : classroom_id,
        'selected_month' : monthField.value
    }); 

    if (response?.ok){
        const data = await response.json();

        material_collections.innerHTML = '';

        if (data){
            
            if (data?.materials?.length == 0){
                material_collections.insertAdjacentHTML("beforeend", ` 
                    <div class="material-empty" >
                        <h3 class="poppins-light"> There are no material uploaded this month! </h3>
                    </div>
                `);
                return;
            }
            
            data.materials.forEach((material) => {
                materials[material.id] = material; 
                const date = new Date(material.created_at); 
                // material_collections.insertAdjacentHTML("beforeend", ` 
                //     <div class="material-container">
                //         <img data-material-id="${material.id}" data-action="delete" src="/static/assets/delete-materials-icon.svg" alt="" class="collections-delete-button">
                //         <h2 class="poppins-regular ellipsis"> ${material.material_name} </h2>
                //         <h5 class="poppins-light ellipsis">Date Uploaded : ${date.toLocaleDateString('en-US')}</h5>
                //         <button class="poppins-light collection-visit-button" data-material-id="${material.id}" data-action="view" >
                //             Click here to view
                //         </button> 
                //         <span class="collection-category poppins-black">
                //             Material
                //         </span>
                //     </div>
                // `);
            }) 
        }
    }


};

monthField.addEventListener('change', () => {
    get_classroom_materials();
});

get_classroom_materials();

 


