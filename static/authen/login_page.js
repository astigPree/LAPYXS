
const email_field = document.getElementById("email-field");
const password_field = document.getElementById("password-field");
const login_button = document.getElementById("login-button");

login_button.addEventListener("click", async () => {
    const email = email_field.value;
    const password = password_field.value;

    if (login_button.disabled) {
        return;
    }

    login_button.disabled = true;
    showLoadingModal();

    const response = await sendRequest("../api/login", "POST", {
        "email": email,
        "password": password
    });
    hideLoadingModal();

    if (!response){
        // show error message
        showErrorModal('Something went wrong. Please try again later.');
        setTimeout(() => {
            hideErrorModal();
            login_button.disabled = false;
        }, 2000); 
        return;
    }

    if (!response?.ok){
        // show error message
        const error_message = await response.json();
        showErrorModal(error_message?.error);
        setTimeout(() => {
            hideErrorModal();
            login_button.disabled = false;
        }, 2000);
        return;
    }

    const data = await response.json();
    
    if (data){
        showSuccessModal('Login successful.');
        setTimeout(() => {
            hideSuccessModal();
            window.location.href = data?.url || "../home";
        }, 2000);
    }
});
