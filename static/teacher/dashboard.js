if (user_type == "Teacher"){
    (async()=>{
    

    const response = await sendRequest("../api/teacher_get_dashboard", "POST", {}); 

    if (response?.ok){
        const data = await response.json();

        if (data){ 
            document.querySelector('.dashboard-section').classList.add('open');
            document.getElementById('total_classroom').textContent = data?.classroom_count || 0;
            document.getElementById('total_student').textContent = data?.total_students || 0;
            document.getElementById('total_each_classroom').textContent = data?.total_students_all_classroom || 0;
        }


    } 
    })();

} else { 
    (async()=>{
    

    const response = await sendRequest("../api/student_get_dashboard", "POST", {}); 

    if (response?.ok){
        const data = await response.json();

        if (data){ 
            document.querySelector('.dashboard-section').classList.add('open');
            document.getElementById('total_classroom').textContent = data?.number_of_classroom || 0;
            document.getElementById('total_material').textContent = data?.number_of_joined_material || 0;
            document.getElementById('total_activities').textContent = data?.number_of_joined_activity || 0;
        }


    } 
    })();
 
}