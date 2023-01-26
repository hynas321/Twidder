const incorrectPasswordLengthMessage = document.getElementById("incorrect-password-length-message");
const differentPasswordsMessage = document.getElementById("different-passwords-message");
const minPasswordLength = 6
const maxPasswordLength = 12
const elementDisplayed = "block";
const elementHidden = "none";
const incorrectPasswordLengthMessageText = 
    `Incorrect password length, allowed lengths: min = ${minPasswordLength} and max = ${maxPasswordLength}`;

function validateSignInForm(formData) {
    const emailString = formData.signInEmail.value;
    const passwordString = formData.signInPassword.value;

    if (!isPasswordLengthCorrect(passwordString)) {
        displayIncorrectPasswordLengthMessage();
    }
    else if (incorrectPasswordLengthMessage.style.display === elementDisplayed) {
        incorrectPasswordLengthMessage.style.display = elementHidden;
    }
    else {
        console.log(serverstub.signIn(emailString, passwordString));
    }
}

function validateSignUpForm(formData) {
    const passwordString = formData.signUpPassword.value;
    const repeatedPasswordString = formData.repeatedSignUpPassword.value;
    
    if (!(passwordString === repeatedPasswordString)) {
        differentPasswordsMessage.style.display = elementDisplayed;
    }
    else if (!isPasswordLengthCorrect(passwordString) || !isPasswordLengthCorrect(repeatedPasswordString)) {
        displayIncorrectPasswordLengthMessage();
    }
    else if (incorrectPasswordLengthMessage.style.display === elementDisplayed 
        || differentPasswordsMessage.style.display === elementDisplayed) {

        incorrectPasswordLengthMessage.style.display = elementHidden;
        differentPasswordsMessage.style.display = elementHidden;
    }
    else {
        console.log(signUp(formData));
    }
}

function isPasswordLengthCorrect(passwordString) {
    if (passwordString.length < minPasswordLength || passwordString.length > maxPasswordLength) {
        return false;
    }

    return true;
}

function displayIncorrectPasswordLengthMessage() {
    incorrectPasswordLengthMessage.style.display = elementDisplayed;
    incorrectPasswordLengthMessage.textContent = incorrectPasswordLengthMessageText;
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