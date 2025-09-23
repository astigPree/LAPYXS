



const monthField = document.getElementById('month-field');
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
monthField.value = `${year}-${month}`;

 
const announcementField = document.getElementById('announcement');
const announcementButton = document.getElementById('announcement_button');

announcementField.addEventListener('input', function () {
    const hasText = this.value.trim().length > 0;
    announcementButton.style.opacity = hasText ? '1' : '0.5';
    if (hasText) {
        announcementButton.style.cursor = 'pointer';
    } else {
        announcementButton.style.cursor = 'not-allowed';
    }
});


announcementButton.addEventListener('click', function () {
    if (!announcementField.value.trim()) {
        return;
    } 
    
})













