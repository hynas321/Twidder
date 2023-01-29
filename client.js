let errorMessageElement;
let successMessageElement;
let accountTabErrorMessageElement;
let accountTabSuccessMessageElement;

let homeTab;
let accountTab;
let browseTab;

let userDataObject;

const minPasswordLength = 6;
const maxPasswordLength = 12;

const elementDisplayed = "block";
const elementHidden = "none";
const tokenKey = "token";

const differentPasswordsText = "Passwords are not the same";
const incorrectPasswordLengthText = 
    `Incorrect password length, allowed lengths: min = ${minPasswordLength} and max = ${maxPasswordLength}`;

window.addEventListener("load", function() {
    const tokenValue = this.localStorage.getItem(tokenKey);

    if (typeof(tokenValue) != "string") {
        displayWelcomeView();
    }
    else {
        displayProfileView(tokenValue);
    }
});

function displayWelcomeView() {
    const body = document.getElementById("body");
    const welcomeView = document.getElementById("welcomeview");

    body.innerHTML = welcomeView.innerHTML;
    errorMessageElement = document.getElementById("error-message");
    successMessageElement = document.getElementById("success-message");
}

function displayProfileView() {
    const body = document.getElementById("body");
    const profileView = document.getElementById("profileview");

    body.innerHTML = profileView.innerHTML;
    homeTab = document.getElementById("home-tab");
    accountTab = document.getElementById("account-tab");
    browseTab = document.getElementById("browse-tab");

    accountTabErrorMessageElement = document.getElementById("account-tab-error-message");
    accountTabSuccessMessageElement = document.getElementById("account-tab-success-message");
    
    displayHomeTab();
}

function validateSignInForm(signInFormData) {
    const emailString = signInFormData.signInEmail.value;
    const passwordString = signInFormData.signInPassword.value;

    if (!isPasswordLengthCorrect(passwordString)) {
        displayMessage(
            errorMessageElement,
            incorrectPasswordLengthText,
            clearWelcomeViewMessages
        );

        return;
    }

    const signInServerOutputObj = serverstub.signIn(emailString, passwordString);
    console.log(signInServerOutputObj);
    
    if (signInServerOutputObj.success == false) {
        displayMessage(
            errorMessageElement,
            signInServerOutputObj.message,
            clearWelcomeViewMessages
        );

        return;
    }
    
    localStorage.setItem(tokenKey, signInServerOutputObj.data);
    displayProfileView();
}

function validateSignUpForm(signUpFormData) {
    const passwordString = signUpFormData.signUpPassword.value;
    const repeatedPasswordString = signUpFormData.repeatedSignUpPassword.value;
    
    if (!(passwordString == repeatedPasswordString)) {
        displayMessage(
            errorMessageElement,
            differentPasswordsText,
            clearWelcomeViewMessages
        );

        return;
    }
    else if (!isPasswordLengthCorrect(passwordString) || !isPasswordLengthCorrect(repeatedPasswordString)) {
        displayMessage(
            errorMessageElement,
            incorrectPasswordLengthText,
            clearWelcomeViewMessages
        );

        return;
    }

    const signUpServerOutputObj = signUp(signUpFormData);
    console.log(signUpServerOutputObj);

    if (signUpServerOutputObj.success == false) {
        displayMessage(
            errorMessageElement,
            signUpServerOutputObj.message,
            clearWelcomeViewMessages
        );

        return;
    }

    displayMessage(
        successMessageElement,
        signUpServerOutputObj.message,
        clearWelcomeViewMessages
    );
}

function isPasswordLengthCorrect(passwordString) {
    if (passwordString.length < minPasswordLength || passwordString.length > maxPasswordLength) {
        return false;
    }

    return true;
}

function displayMessage(element, message, hideMessagesFunction) {
    hideMessagesFunction();
    element.style.display = elementDisplayed;
    element.textContent = message;
}

function clearWelcomeViewMessages() {
    if (errorMessageElement.style.display == elementDisplayed) {
        errorMessageElement.style.display = elementHidden;
    }

    if (successMessageElement.style.display == elementDisplayed) {
        errorMessageElement.style.display = elementHidden;
    }
}

function clearAccountTabMessages() {
    if (accountTabErrorMessageElement.style.display == elementDisplayed) {
        accountTabErrorMessageElement.style.display = elementHidden;
    }

    if (accountTabSuccessMessageElement.style.display == elementDisplayed) {
        accountTabSuccessMessageElement.style.display = elementHidden;
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

function signOut() {
    const tokenValue = this.localStorage.getItem(tokenKey);

    console.log(serverstub.signOut(tokenValue));
    localStorage.removeItem(tokenKey);
    userDataObject = null;
    displayWelcomeView();
}

function changePassword(changePasswordFormData) {
    const tokenValue = this.localStorage.getItem(tokenKey);
    const oldPassword = changePasswordFormData.oldPassword.value;
    const newPassword = changePasswordFormData.newPassword.value; 
    const repeatedNewPassword = changePasswordFormData.repeatedNewPassword.value;

    if (!isPasswordLengthCorrect(oldPassword) ||
        !isPasswordLengthCorrect(newPassword) ||
        !isPasswordLengthCorrect(repeatedNewPassword)) {

        displayMessage(
            accountTabErrorMessageElement,
            incorrectPasswordLengthText,
            clearAccountTabMessages
        );

        return;
    }

    if (newPassword != repeatedNewPassword) {
        
        displayMessage(
            accountTabErrorMessageElement,
            differentPasswordsText,
            clearAccountTabMessages
        );

        return;
    }

    const changePasswordServerOutputObj = serverstub.changePassword(tokenValue, oldPassword, newPassword);

    console.log(changePasswordServerOutputObj);

    if (changePasswordServerOutputObj.success) {
        displayMessage(
            accountTabSuccessMessageElement,
            changePasswordServerOutputObj.message,
            clearAccountTabMessages
        );
    }
    else {
        displayMessage(
            accountTabErrorMessageElement,
            changePasswordServerOutputObj.message,
            clearAccountTabMessages
        );
    }
}

function displayHomeTab() {
    hideTab();
    homeTab.style.display = elementDisplayed;

    const tokenValue = this.localStorage.getItem(tokenKey);

    if (userDataObject == null) {
        userDataObject = serverstub.getUserDataByToken(tokenValue);
        console.log(userDataObject);
    }

    const emailElement = document.getElementById("email-value");
    const firstname = document.getElementById("firstname-value");
    const familyName = document.getElementById("familyname-value");
    const gender = document.getElementById("gender-value");
    const city = document.getElementById("city-value");
    const country = document.getElementById("country-value");

    emailElement.textContent = userDataObject.data.email;
    firstname.textContent = userDataObject.data.firstname;
    familyName.textContent = userDataObject.data.familyname;
    gender.textContent = userDataObject.data.gender;
    city.textContent = userDataObject.data.city;
    country.textContent = userDataObject.data.country;
}

function displayAccountTab() {
    hideTab();
    accountTab.style.display = elementDisplayed;

}

function displayBrowseTab() {
    hideTab();
    browseTab.style.display = elementDisplayed;
}

function hideTab() {
    if (homeTab.style.display === elementDisplayed) {
        homeTab.style.display = elementHidden;
    }
    else if (accountTab.style.display === elementDisplayed) {
        accountTab.style.display = elementHidden;
    }
    else if (browseTab.style.display === elementDisplayed) {
        browseTab.style.display = elementHidden;
    }
}