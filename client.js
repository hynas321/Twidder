let errorMessageElement;
let successMessageElement;

const minPasswordLength = 6;
const maxPasswordLength = 12;
const elementDisplayed = "block";
const elementHidden = "none";
const differentPasswordsText = "Passwords are not the same";
const incorrectPasswordLengthText = 
    `Incorrect password length, allowed lengths: min = ${minPasswordLength} and max = ${maxPasswordLength}`;

window.addEventListener("load", function() {
    const body = document.getElementById("body");
    const welcomeView = document.getElementById("welcomeview");
    const profileView = document.getElementById("profileview");

    if (true) {
        body.innerHTML = welcomeView.innerHTML;
        errorMessageElement = this.document.getElementById("error-message");
        successMessageElement = this.document.getElementById("success-message");
    }
    else {
        body.innerHTML = profileView.innerHTML;
    }
});

function displayView() {

}

function validateSignInForm(formData) {
    const emailString = formData.signInEmail.value;
    const passwordString = formData.signInPassword.value;

    if (!isPasswordLengthCorrect(passwordString)) {
        displayIncorrectPasswordLengthMessage();
        return;
    }

    const signInServerOutputObj = serverstub.signIn(emailString, passwordString);
    console.log(signInServerOutputObj);
    
    if (signInServerOutputObj.success === false) {
        displayServerErrorMessage(signInServerOutputObj);
        return;
    }
    
    displayServerSuccessMessage(signInServerOutputObj);

    localStorage.setItem("token", signInServerOutputObj.data);
}

function validateSignUpForm(formData) {
    const passwordString = formData.signUpPassword.value;
    const repeatedPasswordString = formData.repeatedSignUpPassword.value;
    
    if (!(passwordString === repeatedPasswordString)) {
        differentPasswordsText.style.display = elementDisplayed;
        return;
    }
    else if (!isPasswordLengthCorrect(passwordString) || !isPasswordLengthCorrect(repeatedPasswordString)) {
        displayIncorrectPasswordLengthMessage();
        return;
    }

    const signUpServerOutputObj = signUp(formData);
    console.log(signUpServerOutputObj);

    if (signUpServerOutputObj.success === false) {
        displayServerErrorMessage(signUpServerOutputObj);
        return;
    }

    displayServerSuccessMessage(signUpServerOutputObj);
}

function isPasswordLengthCorrect(passwordString) {
    if (passwordString.length < minPasswordLength || passwordString.length > maxPasswordLength) {
        return false;
    }

    return true;
}

function displayIncorrectPasswordLengthMessage() {
    hideAllMessages();
    errorMessageElement.style.display = elementDisplayed;
    errorMessageElement.textContent = incorrectPasswordLengthText;
}

function displayDifferentPasswordsMessage() {
    hideAllMessages();
    errorMessageElement.style.display = elementDisplayed;
    errorMessageElement.textContent = differentPasswordsText;
}

function displayServerErrorMessage(serverOutputObj) {
    hideAllMessages();
    errorMessageElement.style.display = elementDisplayed;
    errorMessageElement.textContent = serverOutputObj.message;
}

function displayServerSuccessMessage(serverOutputObj) {
    hideAllMessages();
    successMessageElement.style.display = elementDisplayed;
    successMessageElement.textContent = serverOutputObj.message;
}

function hideAllMessages() {
    if (errorMessageElement.style.display == elementDisplayed) {
        errorMessageElement.style.display = elementHidden;
    }

    if (successMessageElement.style.display == elementDisplayed) {
        errorMessageElement.style.display = elementHidden;
    }
}

function signUp(formData) {
    const dataObject = {
        email: formData.signUpEmail.value,
        password: formData.signUpPassword.value,
        firstname: formData.firstName.value,
        familyname: formData.familyName.value,
        gender: formData.gender.value,
        city: formData.city.value,
        country: formData.country.value
    };

    return serverstub.signUp(dataObject);
}

function signIn(emailString, passwordString) {
    return serverstub.signIn(emailString, passwordString);
}