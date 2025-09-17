
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

    const response = await sendRequest("../api/login", "POST", {
        "email": email,
        "password": password
    });

    if (!response){
        // show error message
        login_button.disabled = false;
        return;
    }

    if (!response?.ok){
        // show error message
        login_button.disabled = false;
        return;
    }

    const data = await response.json();
    if (data){
        window.location.href = data?.url || "../home";
    }
});
