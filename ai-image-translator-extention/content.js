console.log("Content script loaded");

document.addEventListener('focus', () => {
    console.log("Document is focused now");
}, true);

document.addEventListener('click', () => {
    console.log("Document clicked and should be focused");
}, true);
