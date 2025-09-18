
function showLoadingModal(message) {
    if (message) {
        document.getElementById("loading-message").textContent = message;
    }
    document.getElementById("success-modal").style.display = "none";
    document.getElementById("error-modal").style.display = "none";
    document.getElementById("loading-modal").style.display = "flex";
}

function hideLoadingModal() {
    document.getElementById("loading-modal").style.display = "none";
}

function showSuccessModal(message) {
    if (message) {
        document.getElementById("success-message").textContent = message;
    }
    document.getElementById("loading-modal").style.display = "none";
    document.getElementById("error-modal").style.display = "none";
    document.getElementById("success-modal").style.display = "flex";
}

function hideSuccessModal() {
    document.getElementById("success-modal").style.display = "none";
}

function showErrorModal(message) {
    if (message) {
        document.getElementById("error-message").textContent = message;
    }
    document.getElementById("loading-modal").style.display = "none";
    document.getElementById("success-modal").style.display = "none";
    document.getElementById("error-modal").style.display = "flex";
}

function hideErrorModal() {
    document.getElementById("error-modal").style.display = "none";
}




function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}


function reAnimateElement(element, animationClass, display = 'flex') {
    if (!element) {
        console.warn("⚠️ Element not found.");
        return;
    }

    // Step 1: Make it visible (before animation)
    element.style.display = display;

    // Step 2: Temporarily remove the animation class
    element.classList.remove(animationClass);

    // Step 3: Force reflow to reset animation
    void element.offsetWidth;

    // Step 4: Re-add animation class
    element.classList.add(animationClass); 
}
 
function hideModal(element , animationClass ) {
    if (element) {
        element.style.display = 'none';
        element.classList.remove(animationClass);
    }
}



async function sendRequest(url, method, data) {
    
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    try{ 
        const response = await fetch(url, {
            method: method,
            body : formData,
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        return response
        
    } catch (error){
        console.log(error)
        return null
    }
 

}









