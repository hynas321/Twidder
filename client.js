const minPasswordLength = 6;
const maxPasswordLength = 12;

const displayProperty = {
    block: "block",
    none: "none"
};

const localStorageKey = {
    token: "token",
    lastOpenedTab: "lastOpenedTab"
}

const tabs = {
    home: "home-tab",
    account: "account-tab",
    browse: "browse-tab"
}

const differentPasswordsText = "Passwords are not the same";
const incorrectPasswordLengthText = 
    `Incorrect password length, allowed lengths: min = ${minPasswordLength} and max = ${maxPasswordLength}`;

let dataRetrieved = false;

window.onload = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);

    if (typeof(tokenValue) != "string") {
        displayWelcomeView();
    }
    else {
        displayProfileView(tokenValue);
    }
};

var displayWelcomeView = function() {
    const body = document.getElementById("body");
    const welcomeView = document.getElementById("welcomeview");

    body.innerHTML = welcomeView.innerHTML;
}

var displayProfileView = function() {
    const lastTabValue = localStorage.getItem(localStorageKey.lastOpenedTab);
    const body = document.getElementById("body");
    const profileView = document.getElementById("profileview");

    body.innerHTML = profileView.innerHTML;

    if (lastTabValue == tabs.home) {
        displayHomeTab();
    }
    else if (lastTabValue == tabs.account) {
        displayAccountTab();
    }
    else if (lastTabValue == tabs.browse) {
        displayBrowseTab();
    }
    else {
        displayHomeTab();
    }
}

var displayHomeTab = function() {
    const homeTab = document.getElementById("home-tab");

    hidePreviousTabs();
    setActiveButton(tabs.home);
    setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.home);

    homeTab.style.display = displayProperty.block;

    const tokenValue = localStorage.getItem(localStorageKey.token);

    if (!dataRetrieved) {
        const userEmail = serverstub.getUserDataByToken(tokenValue).data.email;

        setUserPersonalInfo();
        displayPostWall(true, userEmail);
        dataRetrieved = true;
    }
}

var displayAccountTab = function() {
    const accountTab = document.getElementById("account-tab");

    hidePreviousTabs();
    setActiveButton(tabs.account);
    setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.account);

    accountTab.style.display = displayProperty.block;
}

var displayBrowseTab = function() {
    const browseTab = document.getElementById("browse-tab");

    hidePreviousTabs();
    setActiveButton(tabs.browse);
    setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.browse);

    browseTab.style.display = displayProperty.block;
}

var hidePreviousTabs = function() {
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

var signIn = function(signInFormData) {
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

    const signInServerOutput = serverstub.signIn(emailString, passwordString);
    console.log(signInServerOutput);
    
    if (signInServerOutput.success == false) {
        displayStatusMessage(
            statusMessageElement,
            signInServerOutput.message,
            false
        );

        return;
    }

    localStorage.setItem(localStorageKey.token, signInServerOutput.data);
    displayProfileView();
}

var signUp = function(signUpFormData) {
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

    const userDataObject = {
        email: signUpFormData.signUpEmail.value,
        password: signUpFormData.signUpPassword.value,
        firstname: signUpFormData.firstName.value,
        familyname: signUpFormData.familyName.value,
        gender: signUpFormData.gender.value,
        city: signUpFormData.city.value,
        country: signUpFormData.country.value
    };

    const signUpServerOutput = serverstub.signUp(userDataObject);
    console.log(signUpServerOutput);

    if (signUpServerOutput.success == false) {
        displayStatusMessage(
            statusMessageElement,
            signUpServerOutput.message,
            false
        );
        
        return;
    }

    displayStatusMessage(
        statusMessageElement,
        signUpServerOutput.message,
        true
    )
}

var isPasswordLengthCorrect = function(passwordString) {
    if (passwordString.length < minPasswordLength || passwordString.length > maxPasswordLength) {
        return false;
    }

    return true;
}

var displayStatusMessage = function(statusMessageElement, statusMessage, success) {
    if (success) {
        statusMessageElement.classList.replace("error-message", "success-message");
    }
    else {
        statusMessageElement.classList.replace("success-message", "error-message");
    }

    statusMessageElement.style.display = displayProperty.block;
    statusMessageElement.textContent = statusMessage;
}

var signOut = function() {
    const tokenValue = this.localStorage.getItem(localStorageKey.token);

    console.log(serverstub.signOut(tokenValue));
    
    dataRetrieved = false;
    clearLocalStorage();
    displayWelcomeView();
}

var changePassword = function(changePasswordFormData) {
    const tokenValue = this.localStorage.getItem(localStorageKey.token);
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

    const changePasswordServerOutput = serverstub.changePassword(tokenValue, oldPassword, newPassword);

    console.log(changePasswordServerOutput);

    if (changePasswordServerOutput.success) {
        displayStatusMessage(
            accountTabStatusMessageElement,
            changePasswordServerOutput.message,
            true
        );

        return;
    }
    else {
        displayStatusMessage(
            accountTabStatusMessageElement,
            changePasswordServerOutput.message,
            false
        );
    }
}

var postMessageToWall = function(ownPostWall) {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    let email;
    let recipientEmail;
    let postWall;
    let textArea;
    
    if (ownPostWall) {
        postWall = document.getElementById("post-wall");
        textArea = document.getElementById("text-area");

        if (textArea.value == "") {
            return;
        }

        email = serverstub.getUserDataByToken(tokenValue).data.email;
        recipientEmail = email;
    }
    else {
        postWall = document.getElementById("searched-post-wall");
        textArea = document.getElementById("searched-text-area");

        if (textArea.value == "") {
            return;
        }

        email = serverstub.getUserDataByToken(tokenValue).data.email;
        recipientEmail = document.getElementById("searchedEmail").value;
    }

    console.log(serverstub.postMessage(tokenValue, textArea.value, recipientEmail));

    if (ownPostWall) {
        displayPostWall(ownPostWall, email);
    }
    else {
        displayPostWall(ownPostWall, recipientEmail);
    }

}

var displayPostWall = function(ownPostWall, email) {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    let userMessages;
    let postWall;

    if (ownPostWall) {
        userMessages = serverstub.getUserMessagesByToken(tokenValue).data;
        postWall = document.getElementById("post-wall");
    }
    else {
        userMessages = serverstub.getUserMessagesByEmail(tokenValue, email).data;
        postWall = document.getElementById("searched-post-wall");
    };

    console.log("Post wall displayed");

    postWall.innerHTML = "";

    for (let i = 0; i < userMessages.length; i++) {
        postWall.innerHTML += `<br><b><div style="color:red">${userMessages[i].writer}</b></div> ${userMessages[i].content}<br>`;
    }
}

var refreshPostWall = function(tabName) {
    if (tabName == tabs.home) {
        displayPostWall(true, null);
    }
    else if (tabName == tabs.browse) {
        const recipientEmail = document.getElementById("searchedEmail").value;

        displayPostWall(false, recipientEmail);
    }
}

var setUserPersonalInfo = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const userData = serverstub.getUserDataByToken(tokenValue);

    console.log(userData);

    document.getElementById("email-value").textContent = userData.data.email;
    document.getElementById("firstname-value").textContent = userData.data.firstname;
    document.getElementById("familyname-value").textContent = userData.data.familyname;
    document.getElementById("gender-value").textContent = userData.data.gender;
    document.getElementById("city-value").textContent = userData.data.city;
    document.getElementById("country-value").textContent = userData.data.country;
}

var setSearchedUserPersonalInfo = function(userDataByEmailServerOutput) {
    document.getElementById("searched-email-value").textContent = userDataByEmailServerOutput.data.email;
    document.getElementById("searched-firstname-value").textContent = userDataByEmailServerOutput.data.firstname;
    document.getElementById("searched-familyname-value").textContent = userDataByEmailServerOutput.data.familyname;
    document.getElementById("searched-gender-value").textContent = userDataByEmailServerOutput.data.gender;
    document.getElementById("searched-city-value").textContent = userDataByEmailServerOutput.data.city;
    document.getElementById("searched-country-value").textContent = userDataByEmailServerOutput.data.country;
}

var displaySearchedUserProfile = function(browseFormDataObject) {
    const embeddedTab = document.getElementById("embedded-tab");
    const browseTabStatusMessageElement = document.getElementById("browse-tab-status-message");
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const email = browseFormDataObject.searchedEmail.value;

    const userDataByEmailServerOutput = serverstub.getUserDataByEmail(tokenValue, email);

    console.log(userDataByEmailServerOutput);

    if (userDataByEmailServerOutput.success == false) {
        embeddedTab.style.display = displayProperty.none;

        displayStatusMessage(
            browseTabStatusMessageElement,
            userDataByEmailServerOutput.message,
            false
        );

        return;
    }

    if (browseTabStatusMessageElement.style.display == displayProperty.block) {
        browseTabStatusMessageElement.style.display = displayProperty.none;
    } 
    
    setSearchedUserPersonalInfo(userDataByEmailServerOutput);

    embeddedTab.style.display = displayProperty.block;

    displayPostWall(false, email);
}

var setLocalStorageValue = function(key, stringValue) {
    localStorage.removeItem(key);
    localStorage.setItem(key, stringValue);
}

var clearLocalStorage = function() {
    localStorage.removeItem(localStorageKey.token);
    localStorage.removeItem(localStorageKey.lastOpenedTab);
}

var setActiveButton = function(tabName) {
    const homeButton = document.getElementById("btn-home-tab");
    const accountButton = document.getElementById("btn-account-tab");
    const browseButton = document.getElementById("btn-browse-tab");

    if (tabName == tabs.home) {
        homeButton.style.backgroundColor = "#53e058";
        accountButton.style.backgroundColor = "#22c0f4";
        browseButton.style.backgroundColor = "#22c0f4";
    }
    else if (tabName == tabs.account) {
        homeButton.style.backgroundColor = "#22c0f4";
        accountButton.style.backgroundColor = "#53e058";
        browseButton.style.backgroundColor = "#22c0f4";
    }
    else if (tabName == tabs.browse) {
        homeButton.style.backgroundColor = "#22c0f4";
        accountButton.style.backgroundColor = "#22c0f4";
        browseButton.style.backgroundColor = "#53e058";
    }
}