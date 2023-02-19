let localStorageManager;
let tabManager;
let userProfileManager;
let postWallManager;
let accountManager;
let viewManager;

const minPasswordLength = 6;
let userDataRetrieved = false;

const displayProperty = {
    block: "block",
    none: "none"
};

const localStorageKey = {
    token: "token",
    lastOpenedTab: "lastOpenedTab"
};

const tabs = {
    home: "home-tab",
    account: "account-tab",
    browse: "browse-tab"
};


window.onload = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);

    localStorageManager = new LocalStorageManager();
    tabManager = new TabManager();
    userProfileManager = new UserProfileManager();
    postWallManager = new PostWallManager();
    accountManager = new AccountManager();
    viewManager = new ViewManager();

    if (typeof(tokenValue) != "string") {
        viewManager.displayWelcomeView();
    }
    else {
        viewManager.displayProfileView(tokenValue);
    }
};


class ViewManager {
    displayWelcomeView = function() {
        const body = document.getElementById("body");
        const welcomeView = document.getElementById("welcomeview");
    
        body.innerHTML = welcomeView.innerHTML;
    }
    
    displayProfileView = function() {
        const lastTabValue = localStorage.getItem(localStorageKey.lastOpenedTab);
        const body = document.getElementById("body");
        const profileView = document.getElementById("profileview");
    
        body.innerHTML = profileView.innerHTML;
    
        if (lastTabValue == tabs.home) {
            tabManager.displayHomeTab();
        }
        else if (lastTabValue == tabs.account) {
            tabManager.displayAccountTab();
        }
        else if (lastTabValue == tabs.browse) {
            tabManager.displayBrowseTab();
        }
        else {
            tabManager.displayHomeTab();
        }
    }
    
    displayStatusMessage = function(statusMessageElement, statusMessage, success) {
        if (success) {
            statusMessageElement.classList.replace("error-message", "success-message");
        }
        else {
            statusMessageElement.classList.replace("success-message", "error-message");
        }
    
        statusMessageElement.style.display = displayProperty.block;
        statusMessageElement.textContent = statusMessage;
    }
}

class AccountManager {
    signIn = function(signInFormData) {
        const emailString = signInFormData.signInEmail.value;
        const passwordString = signInFormData.signInPassword.value;
        const statusMessageElement = document.getElementById("status-message");
    
        if (!this.isPasswordLengthCorrect(passwordString)) {
            viewManager.displayStatusMessage(
                statusMessageElement,
                `Incorrect password length, allowed min length = ${minPasswordLength}`,
                false
            );
    
            return;
        }
    
        const credentials = {
            email: emailString,
            password: passwordString
        };
    
        const request = new XMLHttpRequest();
    
        request.open("POST", "/sign-in", true)
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(credentials))
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 201) {
                    const jsonResponse = JSON.parse(request.responseText);
    
                    localStorage.setItem(localStorageKey.token, jsonResponse.token);
                    viewManager.displayProfileView();
                }
                else if (request.status == 400) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Missing credentials",
                        false
                    );
                }
                else if (request.status == 404) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "User not found",
                        false
                    );
                }
                else if (request.status == 401) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Incorrect credentials",
                        false
                    );
                }
                else if (request.status == 500) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Unexpected error, try again",
                        false
                    );
                }
                else {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Unexpected error, try again",
                        false
                    );
                }
            }
        }
    }
    
    signUp = function(signUpFormData) {
        const passwordString = signUpFormData.signUpPassword.value;
        const repeatedPasswordString = signUpFormData.repeatedSignUpPassword.value;
        const statusMessageElement = document.getElementById("status-message");
    
        if (!(passwordString == repeatedPasswordString)) {
            viewManager.displayStatusMessage(
                statusMessageElement,
                "Passwords are not the same",
                false
            );
    
            return;
        }
        else if (!this.isPasswordLengthCorrect(passwordString) || !this.isPasswordLengthCorrect(repeatedPasswordString)) {
            viewManager.displayStatusMessage(
                statusMessageElement,
                `Incorrect password length, allowed min length = ${minPasswordLength}`,
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
    
        const request = new XMLHttpRequest();
    
        request.open("POST", "/sign-up", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(userDataObject));
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 201) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Account created successfully",
                        true
                    )
                }
                else if (request.status == 400) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Missing credentials",
                        false
                    );               
                }
                else if (request.status == 200) {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "User already exists",
                        false
                    );       
                }
                else {
                    viewManager.displayStatusMessage(
                        statusMessageElement,
                        "Unexpected error, try again",
                        false
                    );
                }
            }
        }
    }
    
    isPasswordLengthCorrect = function(passwordString) {
        if (passwordString.length < minPasswordLength) {
            return false;
        }
    
        return true;
    }

    changePassword = function(changePasswordFormData) {
        const tokenValue = localStorage.getItem(localStorageKey.token);
        const oldPassword = changePasswordFormData.oldPassword.value;
        const newPassword = changePasswordFormData.newPassword.value; 
        const repeatedNewPassword = changePasswordFormData.repeatedNewPassword.value;
        const accountTabStatusMessageElement = document.getElementById("account-tab-status-message");
    
        if (!this.isPasswordLengthCorrect(oldPassword) ||
            !this.isPasswordLengthCorrect(newPassword) ||
            !this.isPasswordLengthCorrect(repeatedNewPassword)) {
    
                viewManager.displayStatusMessage(
                accountTabStatusMessageElement,
                `Incorrect password length, allowed min length = ${minPasswordLength}`,
                false
            );
    
            return;
        }
    
        if (newPassword != repeatedNewPassword) {
            viewManager.displayStatusMessage(
                accountTabStatusMessageElement,
                "Passwords are not the same",
                false
            );
    
            return;
        }
    
        const passwords = {
            old_password: oldPassword,
            new_password: newPassword
        };
    
        const request = new XMLHttpRequest();
    
        request.open("PUT", "/change-password", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("token", tokenValue);
        request.send(JSON.stringify(passwords))
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    viewManager.displayStatusMessage(
                        accountTabStatusMessageElement,
                        "Password changed successfully",
                        true
                    );
                }
                else if (request.status == 400) {
                    viewManager.displayStatusMessage(
                        accountTabStatusMessageElement,
                        "Missing input",
                        false
                    );
                }
                else if (request.status == 401) {
                    viewManager.displayStatusMessage(
                        accountTabStatusMessageElement,
                        "You are not logged in, try to sign in again",
                        false
                    );
                }
                else if (request.status == 404) {
                    viewManager.displayStatusMessage(
                        accountTabStatusMessageElement,
                        "User not found, try to sign in again",
                        false
                    );
                }
                else if (request.status == 409) {
                    viewManager.displayStatusMessage(
                        accountTabStatusMessageElement,
                        "Incorrect password input(s): incorrect old password or the new password is the same as the old",
                        false
                    );
                }
                else {
                    viewManager.displayStatusMessage(
                        accountTabStatusMessageElement,
                        "Password change error",
                        false
                    );
                }
            }
        }
    }

    signOut = function() {
        const tokenValue = localStorage.getItem(localStorageKey.token);
        const request = new XMLHttpRequest();
    
        request.open("DELETE", "/sign-out", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("token", tokenValue);
        request.send(JSON.stringify({request: "sign-out"}));
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    userDataRetrieved = false;
                    localStorageManager.clearLocalStorage();
                    viewManager.displayWelcomeView();
                }
                else {
                    userDataRetrieved = false;
                    localStorageManager.clearLocalStorage();
                    viewManager.displayWelcomeView();
                }
            }
        }
    }
}

class UserProfileManager {
    displayUserProfile = function() {
        const tokenValue = localStorage.getItem(localStorageKey.token);
        const request = new XMLHttpRequest();
    
        request.open("GET", "/get-user-data-by-token", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("token", tokenValue);
        request.send(JSON.stringify({request: "get-user-data-by-token"}));
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    const userData = JSON.parse(request.response);
                    
                    console.log(userData);
    
                    document.getElementById("email-value").textContent = userData.data.email;
                    document.getElementById("firstname-value").textContent = userData.data.firstname;
                    document.getElementById("familyname-value").textContent = userData.data.familyname;
                    document.getElementById("gender-value").textContent = userData.data.gender;
                    document.getElementById("city-value").textContent = userData.data.city;
                    document.getElementById("country-value").textContent = userData.data.country;
                }
            }
        }
    }
    
    displaySearchedUserProfile = function(browseFormDataObject) {
        const embeddedTab = document.getElementById("embedded-tab");
        const browseTabStatusMessageElement = document.getElementById("browse-tab-status-message");
        const tokenValue = localStorage.getItem(localStorageKey.token);
        const email = browseFormDataObject.searchedEmail.value;
        const thisObj = this
    
        const request = new XMLHttpRequest();
    
        request.open("GET", "/get-user-data-by-email/" + email, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("token", tokenValue);
        request.send(JSON.stringify({request: "get-user-data-by-email"}));
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    const userData = JSON.parse(request.response);
    
                    if (browseTabStatusMessageElement.style.display == displayProperty.block) {
                        browseTabStatusMessageElement.style.display = displayProperty.none;
                    } 
                    
                    thisObj.setSearchedUserPersonalInfo(userData);
                
                    embeddedTab.style.display = displayProperty.block;
                
                    postWallManager.displayPostWall(false, email);
                }
                else {
                    if (browseTabStatusMessageElement.style.display == displayProperty.block) {
                        browseTabStatusMessageElement.style.display = displayProperty.none;
                    } 
    
                    embeddedTab.style.display = displayProperty.none;
    
                    viewManager.displayStatusMessage(
                        browseTabStatusMessageElement,
                        "User does not exist",
                        false
                    );
                }
            }
        }
    }

    setSearchedUserPersonalInfo = function(userData) {
        document.getElementById("searched-email-value").textContent = userData.data.email;
        document.getElementById("searched-firstname-value").textContent = userData.data.firstname;
        document.getElementById("searched-familyname-value").textContent = userData.data.familyname;
        document.getElementById("searched-gender-value").textContent = userData.data.gender;
        document.getElementById("searched-city-value").textContent = userData.data.city;
        document.getElementById("searched-country-value").textContent = userData.data.country;
    }
}

class PostWallManager {
    postMessageToWall = async function(ownPostWall) {
        const tokenValue = localStorage.getItem(localStorageKey.token);
        let emails = {
            email,
            recipientEmail
        };
        let postWall;
        let textArea;
        
        var _getUserDataAsync = async function() {
            const request = new XMLHttpRequest();
    
            request.open("GET", "/get-user-data-by-token", true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.setRequestHeader("token", tokenValue);
            request.send(JSON.stringify({request: "get-user-data-by-token"}));
            request.onreadystatechange = async function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        const response = JSON.parse(request.response);
                        emails.email = response.email;
    
                        return await emails;
                    }
                }
            }
        }
    
        if (ownPostWall) {
            postWall = document.getElementById("post-wall");
            textArea = document.getElementById("text-area");
    
            if (textArea.value == "") {
                return;
            }
    
            emails = await _getUserDataAsync();
        }
        else {
            postWall = document.getElementById("searched-post-wall");
            textArea = document.getElementById("searched-text-area");
    
            if (textArea.value == "") {
                return;
            }
        
            var getUserDataByTokenAsync = async function() {
                const request = new XMLHttpRequest();
    
                request.open("GET", "/get-user-data-by-token", true);
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                request.setRequestHeader("token", tokenValue);
                request.send(JSON.stringify({request: "get-user-data-by-token"}));
                request.onreadystatechange = async function() {
                    if (request.readyState == 4) {
                        if (request.status == 200) {
                            const response = JSON.parse(request.response);
                            const emails = {
                                email: response.email,
                                recipientEmail: document.getElementById("searchedEmail").value
                            };
    
                            return await emails
                        }
                    }
                }
            }
    
            emails = await getUserDataByTokenAsync();
        }
    
        const postMessageBody = {
            message: textArea.innerHTML,
            email: recipientEmail
        };
    
        const request = new XMLHttpRequest();
    
        request.open("POST", "/post-message", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("token", tokenValue);
        request.send(JSON.stringify(postMessageBody));
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    
                }
            }
        }
    }
    
    displayPostWall = function(ownPostWall, email) {
        const tokenValue = localStorage.getItem(localStorageKey.token);
        let userMessages;
        let postWall;
    
        if (ownPostWall) {
            const request = new XMLHttpRequest();
    
            request.open("GET", "/get-user-messages-by-token", true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.setRequestHeader("token", tokenValue);
            request.send(JSON.stringify({request: "get-user-messages-by-token"}));
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        const response = JSON.parse(request.response);
    
                        userMessages = response.messages;
                        postWall = document.getElementById("post-wall");
                        postWall.innerHTML = "";
    
                        for (let i = 0; i < userMessages.length; i++) {
                            postWall.innerHTML +=
                                `<br><b><div style="color:red">${userMessages[i].writer}</b></div> ${userMessages[i].content}<br>`;
                        }
                    }
                }
            }
        }
        else {
            const request = new XMLHttpRequest();
    
            request.open("GET", "/get-user-messages-by-email/" + email, true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.setRequestHeader("token", tokenValue);
            request.send(JSON.stringify({request: "get-user-messages-by-email"}));
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        const response = JSON.parse(request.response);
    
                        userMessages = response.messages;
                        postWall = document.getElementById("searched-post-wall");
                        postWall.innerHTML = "";
    
                        for (let i = 0; i < userMessages.length; i++) {
                            postWall.innerHTML +=
                                `<br><b><div style="color:red">${userMessages[i].writer}</b></div> ${userMessages[i].content}<br>`;
                        }
                    }
                }
            }
        };
    }
    
    refreshPostWall = function(tabName) {
        if (tabName == tabs.home) {
            this.displayPostWall(true, null);
        }
        else if (tabName == tabs.browse) {
            const recipientEmail = document.getElementById("searchedEmail").value;
    
            this.displayPostWall(false, recipientEmail);
        }
    }
}

class TabManager {
    displayHomeTab = function() {
        const homeTab = document.getElementById("home-tab");
    
        this.hidePreviousTabs();
        this.setActiveButton(tabs.home);
        localStorageManager.setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.home);
    
        homeTab.style.display = displayProperty.block;
    
        const tokenValue = localStorage.getItem(localStorageKey.token);
    
        if (!userDataRetrieved) {
            const request = new XMLHttpRequest();
    
            request.open("GET", "/get-user-data-by-token", true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.setRequestHeader("token", tokenValue);
            request.send({request: "get-user-data-by-token"});
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        const response = JSON.parse(request.response);
    
                        userProfileManager.displayUserProfile();
                        postWallManager.displayPostWall(true, response.email);
                        userDataRetrieved = true;
                    }
                    else {
                        signOut();
    
                        viewManager.displayStatusMessage(
                            accountTabStatusMessageElement,
                            "User data error",
                            false
                        );
                    }
                }
            }
        }
    }
    
    displayAccountTab = function() {
        const accountTab = document.getElementById("account-tab");
    
        this.hidePreviousTabs();
        this.setActiveButton(tabs.account);
        localStorageManager.setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.account);
    
        accountTab.style.display = displayProperty.block;
    }
    
    displayBrowseTab = function() {
        const browseTab = document.getElementById("browse-tab");
    
        this.hidePreviousTabs();
        this.setActiveButton(tabs.browse);
        localStorageManager.setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.browse);
    
        browseTab.style.display = displayProperty.block;
    }
    
    hidePreviousTabs = function() {
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

    setActiveButton = function(tabName) {
        const homeButton = document.getElementById("btn-home-tab");
        const accountButton = document.getElementById("btn-account-tab");
        const browseButton = document.getElementById("btn-browse-tab");
        const blueColor = "#22c0f4";
        const limeColor = "#53e058";
    
        homeButton.style.backgroundColor = blueColor;
        accountButton.style.backgroundColor = blueColor;
        browseButton.style.backgroundColor = blueColor;
    
        if (tabName == tabs.home) {
            homeButton.style.backgroundColor = limeColor;
        }
        else if (tabName == tabs.account) {
            accountButton.style.backgroundColor = limeColor;
        }
        else if (tabName == tabs.browse) {
            browseButton.style.backgroundColor = limeColor;
        }
        else {
            homeButton.style.backgroundColor = limeColor;
        }
    }
}

class LocalStorageManager {
    setLocalStorageValue = function(key, stringValue) {
        localStorage.removeItem(key);
        localStorage.setItem(key, stringValue);
    }
    
    clearLocalStorage = function() {
        localStorage.removeItem(localStorageKey.token);
        localStorage.removeItem(localStorageKey.lastOpenedTab);
    }
}