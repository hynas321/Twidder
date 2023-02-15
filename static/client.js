const minPasswordLength = 6;

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

const differentPasswordsText = "Passwords are not the same";
const incorrectPasswordLengthText = 
    `Incorrect password length, allowed min length = ${minPasswordLength}`;

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
        const request = new XMLHttpRequest();

        request.open("GET", "/get-user-data-by-token", true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.setRequestHeader("token", tokenValue);
        request.send({request: "get-user-data-by-token"});
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    const response = JSON.parse(request.response);

                    setUserPersonalInfo();
                    displayPostWall(true, response.email);
                    dataRetrieved = true;
                }
                else {
                    signOut();

                    displayStatusMessage(
                        accountTabStatusMessageElement,
                        "User data error",
                        false
                    );
                }
            }
        }
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
            if (request.status == 200) {
                const jsonResponse = JSON.parse(request.responseText);

                localStorage.setItem(localStorageKey.token, jsonResponse.token);
                displayProfileView();
            }
            else if (request.status == 400) {
                displayStatusMessage(
                    statusMessageElement,
                    "Missing credentials",
                    false
                );
            }
            else if (request.status == 404) {
                displayStatusMessage(
                    statusMessageElement,
                    "User not found",
                    false
                );
            }
            else if (request.status == 401) {
                displayStatusMessage(
                    statusMessageElement,
                    "Incorrect credentials",
                    false
                );
            }
            else if (request.status == 500) {
                displayStatusMessage(
                    statusMessageElement,
                    "Unexpected error, try again",
                    false
                );
            }
            else {
                displayStatusMessage(
                    statusMessageElement,
                    "Unexpected error, try again",
                    false
                );
            }
        }
    }
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

    const request = new XMLHttpRequest();

    request.open("POST", "/sign-up", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(userDataObject));
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 201) {
                displayStatusMessage(
                    statusMessageElement,
                    "Account created successfully",
                    true
                )
            }
            else if (request.status == 400) {
                displayStatusMessage(
                    statusMessageElement,
                    "Missing credentials",
                    false
                );               
            }
            else if (request.status == 409) {
                displayStatusMessage(
                    statusMessageElement,
                    "User already exists",
                    false
                );       
            }
            else {
                displayStatusMessage(
                    statusMessageElement,
                    "Unexpected error, try again",
                    false
                );
            }
        }
    }
}

var isPasswordLengthCorrect = function(passwordString) {
    if (passwordString.length < minPasswordLength) {
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
    const request = new XMLHttpRequest();

    request.open("POST", "/sign-out", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.setRequestHeader("token", tokenValue);
    request.send(JSON.stringify({request: "sign-out"}));
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                dataRetrieved = false;
                clearLocalStorage();
                displayWelcomeView();
            }
            else {
                dataRetrieved = false;
                clearLocalStorage();
                displayWelcomeView();
            }
        }
    }
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
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "Password changed successfully",
                    true
                );
            }
            else if (request.status == 400) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "Missing input",
                    false
                );
            }
            else if (request.status == 401) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "You are not logged in, try to sign in again",
                    false
                );
            }
            else if (request.status == 404) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "User not found, try to sign in again",
                    false
                );
            }
            else if (request.status == 409) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "Incorrect password input(s): incorrect old password or the new password is the same as the old",
                    false
                );
            }
            else {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "Password change error",
                    false
                );
            }
        }
    }
}

var postMessageToWall = async function(ownPostWall) {
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

var displayPostWall = function(ownPostWall, email) {
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

var setSearchedUserPersonalInfo = function(userData) {
    document.getElementById("searched-email-value").textContent = userData.data.email;
    document.getElementById("searched-firstname-value").textContent = userData.data.firstname;
    document.getElementById("searched-familyname-value").textContent = userData.data.familyname;
    document.getElementById("searched-gender-value").textContent = userData.data.gender;
    document.getElementById("searched-city-value").textContent = userData.data.city;
    document.getElementById("searched-country-value").textContent = userData.data.country;
}

var displaySearchedUserProfile = function(browseFormDataObject) {
    const embeddedTab = document.getElementById("embedded-tab");
    const browseTabStatusMessageElement = document.getElementById("browse-tab-status-message");
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const email = browseFormDataObject.searchedEmail.value;

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
                
                setSearchedUserPersonalInfo(userData);
            
                embeddedTab.style.display = displayProperty.block;
            
                displayPostWall(false, email);
            }
            else {
                if (browseTabStatusMessageElement.style.display == displayProperty.block) {
                    browseTabStatusMessageElement.style.display = displayProperty.none;
                } 

                embeddedTab.style.display = displayProperty.none;

                displayStatusMessage(
                    browseTabStatusMessageElement,
                    "User does not exist",
                    false
                );
            }
        }
    }
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