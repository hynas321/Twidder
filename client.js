let errorMessageElement;
let successMessageElement;

let homeTab;
let accountTab;
let browseTab;

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

function displayProfileView(token) {
    const body = document.getElementById("body");
    const profileView = document.getElementById("profileview");

    body.innerHTML = profileView.innerHTML;
    homeTab = document.getElementById("home-tab");
    accountTab = document.getElementById("account-tab");
    browseTab = document.getElementById("browse-tab");
    
    displayHomeTab();
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
    
    localStorage.setItem(tokenKey, signInServerOutputObj.data);
    displayProfileView();
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

function signOut() {
    const tokenValue = this.localStorage.getItem(tokenKey);

    console.log(serverstub.signOut(tokenValue));
    localStorage.removeItem(tokenKey);
    displayWelcomeView();
}

function displayHomeTab() {
    hideTab();
    homeTab.style.display = elementDisplayed;

    const tokenValue = this.localStorage.getItem(tokenKey);
    const userDataObject = serverstub.getUserDataByToken(tokenValue);

    console.log(userDataObject);

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
    if (homeTab.style.display == elementDisplayed) {
        homeTab.style.display = elementHidden;
    }
    else if (accountTab.style.display == elementDisplayed) {
        accountTab.style.display = elementHidden;
    }
    else if (browseTab.style.display == elementDisplayed) {
        browseTab.style.display = elementHidden;
    }
}