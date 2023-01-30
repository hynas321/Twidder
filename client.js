let errorMessageElement;
let successMessageElement;
let accountTabErrorMessageElement;
let accountTabSuccessMessageElement;
let browseTabErrorMessageElement;

let homeTab;
let accountTab;
let browseTab;

let userDataObject;
let homeTabMessagesArray;
let browseTabMessagesArray;

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
    errorMessageElement = this.document.getElementById("error-message");
    successMessageElement = this.document.getElementById("success-message");

}

function displayProfileView() {
    const body = document.getElementById("body");
    const profileView = document.getElementById("profileview");

    body.innerHTML = profileView.innerHTML;
    homeTab = document.getElementById("home-tab");
    accountTab = document.getElementById("account-tab");
    browseTab = document.getElementById("browse-tab");

    displayHomeTab();
}

function displayHomeTab() {
    hideTabs();
    homeTab.style.display = elementDisplayed;

    const tokenValue = this.localStorage.getItem(tokenKey);

    if (userDataObject == undefined) {
        userDataObject = serverstub.getUserDataByToken(tokenValue);
        console.log(userDataObject);
    }

    const email = document.getElementById("email-value");
    const firstname = document.getElementById("firstname-value");
    const familyName = document.getElementById("familyname-value");
    const gender = document.getElementById("gender-value");
    const city = document.getElementById("city-value");
    const country = document.getElementById("country-value");

    email.textContent = userDataObject.data.email;
    firstname.textContent = userDataObject.data.firstname;
    familyName.textContent = userDataObject.data.familyname;
    gender.textContent = userDataObject.data.gender;
    city.textContent = userDataObject.data.city;
    country.textContent = userDataObject.data.country;

    if (homeTabMessagesArray == undefined) {
        displayUserMessages(tokenValue, userDataObject.data.email);
    }
}

function displayAccountTab() {
    hideTabs();
    accountTab.style.display = elementDisplayed;
    accountTabErrorMessageElement = this.document.getElementById("account-tab-error-message");
    accountTabSuccessMessageElement = this.document.getElementById("account-tab-success-message");
}

function displayBrowseTab() {
    hideTabs();
    browseTab.style.display = elementDisplayed;
    browseTabErrorMessageElement = this.document.getElementById("browse-tab-error-message");
}

function hideTabs() {
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

function clearBrowseTabMessages() {
    if (browseTabErrorMessageElement.style.display == elementDisplayed) {
        browseTabErrorMessageElement.style.display = elementHidden;
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
    userDataObject = undefined;
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

function postMessage() {
    const tokenValue = localStorage.getItem(tokenKey);
    const textArea = document.getElementById("text-area");
    const postWall = document.getElementById("post-wall");
    const textDiv = document.createElement("div");
    const email = userDataObject.email;

    textDiv.innerHTML = textArea.value;

    if (userDataObject == undefined || userDataObject.length == 0) {
        serverstub.postMessage(tokenValue, textArea.value, email);
        postWall.appendChild(textDiv);
    }
    else {
        const firstElement = document.getElementById("message-0");
        serverstub.postMessage(tokenValue, textArea.value, email);
        postWall.insertBefore(textDiv, firstElement);
    }

    textArea.value = "";
}

function displayUserMessages(tokenValue, userEmail) {
    homeTabMessagesArray = serverstub.getUserMessagesByEmail(tokenValue, userEmail).data;
    console.log(homeTabMessagesArray);

    const postWall = document.getElementById("post-wall");

    for (let i = 0; i < homeTabMessagesArray.length; i++) {
        const textDiv = document.createElement("div");

        textDiv.setAttribute("id", `message-${i}`)
        textDiv.innerHTML = homeTabMessagesArray[i].content;
        postWall.appendChild(textDiv);
    }
}

function displayBrowsedUserProfile(browseFormDataObject) {
    const tokenValue = this.localStorage.getItem(tokenKey);
    const inputEmail = browseFormDataObject.browsedEmail.value;

    const getUserDataByEmailOutputObj = serverstub.getUserDataByEmail(tokenValue, inputEmail);
    console.log(getUserDataByEmailOutputObj);

    if (getUserDataByEmailOutputObj.success == false) {
        
        return;
    }

    const email = document.getElementById("browsed-email-value");
    const firstname = document.getElementById("browsed-firstname-value");
    const familyName = document.getElementById("browsed-familyname-value");
    const gender = document.getElementById("browsed-gender-value");
    const city = document.getElementById("browsed-city-value");
    const country = document.getElementById("browsed-country-value");
    
    email.textContent = getUserDataByEmailOutputObj.data.email;
    firstname.textContent = getUserDataByEmailOutputObj.data.firstname;
    familyName.textContent = getUserDataByEmailOutputObj.data.familyname;
    gender.textContent = getUserDataByEmailOutputObj.data.gender;
    city.textContent = getUserDataByEmailOutputObj.data.city;
    country.textContent = getUserDataByEmailOutputObj.data.country;
}