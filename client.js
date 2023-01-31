let userDataObject;
let homeTabMessagesArray;

const minPasswordLength = 6;
const maxPasswordLength = 12;

const displayProperty = {
    block: "block",
    none: "none"
};

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
}

function displayProfileView() {
    const body = document.getElementById("body");
    const profileView = document.getElementById("profileview");

    body.innerHTML = profileView.innerHTML;

    displayHomeTab();
}

function displayHomeTab() {
    const homeTab = document.getElementById("home-tab");

    hidePreviousTabs();
    homeTab.style.display = displayProperty.block;

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
        displayAccountMessages(tokenValue, userDataObject.data.email);
    }
}

function displayAccountTab() {
    const accountTab = document.getElementById("account-tab");

    hidePreviousTabs();
    accountTab.style.display = displayProperty.block;
}

function displayBrowseTab() {
    const browseTab = document.getElementById("browse-tab");

    hidePreviousTabs();
    browseTab.style.display = displayProperty.block;
}

function hidePreviousTabs() {
    const homeTab = document.getElementById("home-tab");

    if (homeTab.style.display == displayProperty.block) {
        homeTab.style.display = displayProperty.none;
        return;
    }

    const accountTab = document.getElementById("account-tab");

    if (accountTab.style.display == displayProperty.block) {
        accountTab.style.display = displayProperty.none;
        return;
    }

    const browseTab = document.getElementById("browse-tab");

    if (browseTab.style.display == displayProperty.block) {
        browseTab.style.display = displayProperty.none;
        return;
    }
}

function validateSignInForm(signInFormData) {
    const emailString = signInFormData.signInEmail.value;
    const passwordString = signInFormData.signInPassword.value;
    const statusMessageElement = document.getElementById("status-message");

    if (!isPasswordLengthCorrect(passwordString)) {
        displayStatusMessage(
            statusMessageElement,
            incorrectPasswordLengthText,
            false
        );

        return;
    }

    const signInServerOutputObj = serverstub.signIn(emailString, passwordString);
    console.log(signInServerOutputObj);
    
    if (signInServerOutputObj.success == false) {
        displayStatusMessage(
            statusMessageElement,
            signInServerOutputObj.message,
            false
        );

        return;
    }
    
    localStorage.setItem(tokenKey, signInServerOutputObj.data);
    displayProfileView();
}

function validateSignUpForm(signUpFormData) {
    const passwordString = signUpFormData.signUpPassword.value;
    const repeatedPasswordString = signUpFormData.repeatedSignUpPassword.value;
    const statusMessageElement = document.getElementById("status-message");

    if (!(passwordString == repeatedPasswordString)) {
        displayStatusMessage(
            statusMessageElement,
            differentPasswordsText,
            false
        );

        return;
    }
    else if (!isPasswordLengthCorrect(passwordString) || !isPasswordLengthCorrect(repeatedPasswordString)) {
        displayStatusMessage(
            statusMessageElement,
            incorrectPasswordLengthText,
            false
        );

        return;
    }

    const signUpServerOutputObj = signUp(signUpFormData);
    console.log(signUpServerOutputObj);

    if (signUpServerOutputObj.success == false) {
        displayStatusMessage(
            statusMessageElement,
            signUpServerOutputObj.message,
            false
        );
        
        return;
    }

    displayProfileView();
}

function isPasswordLengthCorrect(passwordString) {
    if (passwordString.length < minPasswordLength || passwordString.length > maxPasswordLength) {
        return false;
    }

    return true;
}

function displayStatusMessage(statusMessageElement, statusMessage, success) {
    if (success) {
        statusMessageElement.classList.replace("error-message", "success-message");
    }
    else {
        statusMessageElement.classList.replace("success-message", "error-message");
    }

    statusMessageElement.style.display = displayProperty.block;
    statusMessageElement.textContent = statusMessage;
}

function signUp(signUpFormData) {
    const userDataObject = {
        email: signUpFormData.signUpEmail.value,
        password: signUpFormData.signUpPassword.value,
        firstname: signUpFormData.firstName.value,
        familyname: signUpFormData.familyName.value,
        gender: signUpFormData.gender.value,
        city: signUpFormData.city.value,
        country: signUpFormData.country.value
    };

    return serverstub.signUp(userDataObject);
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
    const accountTabStatusMessageElement = document.getElementById("account-tab-status-message");

    if (!isPasswordLengthCorrect(oldPassword) ||
        !isPasswordLengthCorrect(newPassword) ||
        !isPasswordLengthCorrect(repeatedNewPassword)) {

        displayStatusMessage(
            accountTabStatusMessageElement,
            incorrectPasswordLengthText,
            false
        );

        return;
    }

    if (newPassword != repeatedNewPassword) {
        displayStatusMessage(
            accountTabStatusMessageElement,
            differentPasswordsText,
            false
        );

        return;
    }

    const changePasswordServerOutputObj = serverstub.changePassword(tokenValue, oldPassword, newPassword);

    console.log(changePasswordServerOutputObj);

    if (changePasswordServerOutputObj.success) {
        displayStatusMessage(
            accountTabStatusMessageElement,
            changePasswordServerOutputObj.message,
            true
        );

        return;
    }
    else {
        displayStatusMessage(
            accountTabStatusMessageElement,
            changePasswordServerOutputObj.message,
            false
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

function displayAccountMessages(tokenValue, userEmail) {
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

function displaySearchedUserProfile(browseFormDataObject) {
    const tokenValue = this.localStorage.getItem(tokenKey);
    const inputEmail = browseFormDataObject.searchedEmail.value;
    const embeddedTab = document.getElementById("embedded-tab");
    const browseTabStatusMessageElement = document.getElementById("browse-tab-status-message");

    const getUserDataByEmailOutputObj = serverstub.getUserDataByEmail(tokenValue, inputEmail);
    console.log(getUserDataByEmailOutputObj);

    if (getUserDataByEmailOutputObj.success == false) {
        embeddedTab.style.display = displayProperty.none;

        displayStatusMessage(
            browseTabStatusMessageElement,
            getUserDataByEmailOutputObj.message,
            false
        );

        return;
    }

    const email = document.getElementById("searched-email-value");
    const firstname = document.getElementById("searched-firstname-value");
    const familyName = document.getElementById("searched-familyname-value");
    const gender = document.getElementById("searched-gender-value");
    const city = document.getElementById("searched-city-value");
    const country = document.getElementById("searched-country-value");
    
    email.textContent = getUserDataByEmailOutputObj.data.email;
    firstname.textContent = getUserDataByEmailOutputObj.data.firstname;
    familyName.textContent = getUserDataByEmailOutputObj.data.familyname;
    gender.textContent = getUserDataByEmailOutputObj.data.gender;
    city.textContent = getUserDataByEmailOutputObj.data.city;
    country.textContent = getUserDataByEmailOutputObj.data.country;

    embeddedTab.style.display = displayProperty.block;

    const postWall = document.getElementById("browse-post-wall");

    for (let i = 0; i < homeTabMessagesArray.length; i++) {
        const textDiv = document.createElement("div");

        textDiv.setAttribute("id", `message-${i}`)
        textDiv.innerHTML = homeTabMessagesArray[i].content;
        postWall.appendChild(textDiv);
    }
}

function removeMessageNodes() {
    
}