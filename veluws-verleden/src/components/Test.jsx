const test = document.createElement("div");
test.id = "testpopup";

const removePopup = () => {
    const existingPopup = document.getElementById("testpopup");
    if (existingPopup && existingPopup.parentElement) {
        existingPopup.parentElement.removeChild(existingPopup);
    }
};

removePopup();

const message = document.createElement("p");
message.textContent = "Wajow zieke virus";

const closeButton = document.createElement("a")

closeButton.onclick = () => {
    removePopup();
}

test.appendChild(message)
test.appendChild(closeButton)
document.body.appendChild(test)