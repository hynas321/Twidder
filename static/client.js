const minPasswordLength = 6;
let socket;
let userDataRetrieved = false;

const displayProperty = {
    block: "block",
    none: "none"
};

const localStorageKey = {
    token: "token",
    lastOpenedTab: "last-opened-tab",
};

const tabs = {
    home: "home-tab",
    account: "account-tab",
    browse: "browse-tab"
};

window.onload = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);

    if (typeof(tokenValue) != "string") {
        displayWelcomeView();
    }
    else {
        manageSocket();
        displayProfileView(tokenValue);
    }
};

//*** Views ***
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

//*** Account ***
var signIn = function(signInFormData) {
    const emailString = signInFormData.signInEmail.value;
    const passwordString = signInFormData.signInPassword.value;
    const statusMessageElement = document.getElementById("status-message");

    if (!isPasswordLengthCorrect(passwordString)) {
        displayStatusMessage(
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

    const signInRequest = new XMLHttpRequest();

    signInRequest.open("POST", "/sign-in", true)
    signInRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    signInRequest.send(JSON.stringify(credentials))
    signInRequest.onreadystatechange = function() {
        if (signInRequest.readyState == 4) {
            if (signInRequest.status == 201) {
                const jsonResponse = JSON.parse(signInRequest.responseText);

                localStorage.setItem(localStorageKey.token, jsonResponse.token);
                loggedInUserEmail = credentials.email;

                manageSocket();
                displayProfileView();
            }
            else if (signInRequest.status == 400) {
                displayStatusMessage(
                    statusMessageElement,
                    "Missing credentials",
                    false
                );
            }
            else if (signInRequest.status == 404) {
                displayStatusMessage(
                    statusMessageElement,
                    "User not found",
                    false
                );
            }
            else if (signInRequest.status == 401) {
                displayStatusMessage(
                    statusMessageElement,
                    "Incorrect credentials",
                    false
                );
            }
            else if (signInRequest.status == 500) {
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
            "Passwords are not the same",
            false
        );

        return;
    }
    else if (!isPasswordLengthCorrect(passwordString) || !isPasswordLengthCorrect(repeatedPasswordString)) {
        displayStatusMessage(
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

    const signUpRequest = new XMLHttpRequest();

    signUpRequest.open("POST", "/sign-up", true);
    signUpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    signUpRequest.send(JSON.stringify(userDataObject));
    signUpRequest.onreadystatechange = function() {
        if (signUpRequest.readyState == 4) {
            if (signUpRequest.status == 201) {
                displayStatusMessage(
                    statusMessageElement,
                    "Account created successfully",
                    true
                )
            }
            else if (signUpRequest.status == 400) {
                displayStatusMessage(
                    statusMessageElement,
                    "Missing credentials",
                    false
                );               
            }
            else if (signUpRequest.status == 200) {
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

var changePassword = function(changePasswordFormData) {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const oldPassword = changePasswordFormData.oldPassword.value;
    const newPassword = changePasswordFormData.newPassword.value; 
    const repeatedNewPassword = changePasswordFormData.repeatedNewPassword.value;
    const accountTabStatusMessageElement = document.getElementById("account-tab-status-message");

    if (!isPasswordLengthCorrect(oldPassword) ||
        !isPasswordLengthCorrect(newPassword) ||
        !isPasswordLengthCorrect(repeatedNewPassword)) {

        displayStatusMessage(
            accountTabStatusMessageElement,
            `Incorrect password length, allowed min length = ${minPasswordLength}`,
            false
        );

        return;
    }

    if (newPassword != repeatedNewPassword) {
        displayStatusMessage(
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

    const changePasswordRequest = new XMLHttpRequest();

    changePasswordRequest.open("PUT", "/change-password", true);
    changePasswordRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    changePasswordRequest.setRequestHeader("token", tokenValue);
    changePasswordRequest.send(JSON.stringify(passwords))
    changePasswordRequest.onreadystatechange = function() {
        if (changePasswordRequest.readyState == 4) {
            if (changePasswordRequest.status == 200) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "Password changed successfully",
                    true
                );
            }
            else if (changePasswordRequest.status == 400) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "Missing input",
                    false
                );
            }
            else if (changePasswordRequest.status == 401) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "You are not logged in, try to sign in again",
                    false
                );
            }
            else if (changePasswordRequest.status == 404) {
                displayStatusMessage(
                    accountTabStatusMessageElement,
                    "User not found, try to sign in again",
                    false
                );
            }
            else if (changePasswordRequest.status == 409) {
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

var signOut = function(optionalMessage, optionalSuccess) {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const signOutRequest = new XMLHttpRequest();

    signOutRequest.open("DELETE", "/sign-out", true);
    signOutRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    signOutRequest.setRequestHeader("token", tokenValue);
    signOutRequest.send(JSON.stringify({request: "sign-out"}));
    signOutRequest.onreadystatechange = function() {
        if (signOutRequest.readyState == 4) {
            userDataRetrieved = false;
            clearLocalStorage();
            displayWelcomeView();
            socket.disconnect();

            if (optionalMessage != undefined && optionalSuccess != undefined) {
                const statusMessageElement = document.getElementById("status-message");

                displayStatusMessage(
                    statusMessageElement,
                    optionalMessage,
                    optionalSuccess
                );
            }
        }
    }
}

//*** User Profile ***
var displayUserProfile = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const statusMessageElement = document.getElementById("status-message");
    const getUserDataRequest = new XMLHttpRequest();

    getUserDataRequest.open("GET", "/get-user-data-by-token", true);
    getUserDataRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    getUserDataRequest.setRequestHeader("token", tokenValue);
    getUserDataRequest.send(JSON.stringify({request: "get-user-data-by-token"}));
    getUserDataRequest.onreadystatechange = function() {
        if (getUserDataRequest.readyState == 4) {
            if (getUserDataRequest.status == 200) {
                const userData = JSON.parse(getUserDataRequest.response);

                document.getElementById("email-value").textContent = userData.data.email;
                document.getElementById("firstname-value").textContent = userData.data.firstname;
                document.getElementById("familyname-value").textContent = userData.data.familyname;
                document.getElementById("gender-value").textContent = userData.data.gender;
                document.getElementById("city-value").textContent = userData.data.city;
                document.getElementById("country-value").textContent = userData.data.country;

                displayUserPostWall();
            }
            else {
                signOut();

                displayStatusMessage(
                    statusMessageElement,
                    "User data error",
                    false
                )
            }
        }
    }
}
    
var displaySearchedUserProfile = function(browseFormDataObject) {
    const embeddedTab = document.getElementById("embedded-tab");
    const browseTabStatusMessageElement = document.getElementById("browse-tab-status-message");
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const email = browseFormDataObject.searchedEmail.value;
    const getUserDataRequest = new XMLHttpRequest();

    getUserDataRequest.open("GET", "/get-user-data-by-email/" + email, true);
    getUserDataRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    getUserDataRequest.setRequestHeader("token", tokenValue);
    getUserDataRequest.send(JSON.stringify({request: "get-user-data-by-email"}));
    getUserDataRequest.onreadystatechange = function() {
        if (getUserDataRequest.readyState == 4) {
            if (getUserDataRequest.status == 200) {
                const userData = JSON.parse(getUserDataRequest.response);

                if (browseTabStatusMessageElement.style.display == displayProperty.block) {
                    browseTabStatusMessageElement.style.display = displayProperty.none;
                } 
                
                document.getElementById("searched-email-value").textContent = userData.data.email;
                document.getElementById("searched-firstname-value").textContent = userData.data.firstname;
                document.getElementById("searched-familyname-value").textContent = userData.data.familyname;
                document.getElementById("searched-gender-value").textContent = userData.data.gender;
                document.getElementById("searched-city-value").textContent = userData.data.city;
                document.getElementById("searched-country-value").textContent = userData.data.country;
            
                embeddedTab.style.display = displayProperty.block;
                
                displaySearchedUserPostWall();
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

//*** Post Wall ***
async function postMessageToUserWall() {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const textArea = document.getElementById("text-area");
  
    const getUserDataRequest = new XMLHttpRequest();
    getUserDataRequest.open("GET", "/get-user-data-by-token", true);
    getUserDataRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    getUserDataRequest.setRequestHeader("token", tokenValue);

    const getUserDataPromise = new Promise((resolve, reject) => {
        getUserDataRequest.onreadystatechange = function() {
            if (getUserDataRequest.readyState == 4) {
                if (getUserDataRequest.status == 200) {
                    const userData = JSON.parse(getUserDataRequest.response);
                    resolve(userData);
                } 
                else {
                    reject('User data error');
                }
            }
        }
    });
  
    getUserDataRequest.send(JSON.stringify({request: "get-user-data-by-token"}));
    const userData = await getUserDataPromise;

    const postMessageBody = {
        recipient: userData.data.email,
        content: textArea.value
    }

    const postMessageRequest = new XMLHttpRequest();
    postMessageRequest.open("POST", "/post-message", true);
    postMessageRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    postMessageRequest.setRequestHeader("token", tokenValue);
    postMessageRequest.send(JSON.stringify(postMessageBody));
    postMessageRequest.onreadystatechange = function() {
        if (postMessageRequest.readyState == 4) {
            if (postMessageRequest.status == 201) {
                textArea.value = "";
                displayUserPostWall();
            }
        }
    }
  }

var postMessageToSearchedUserWall = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const textArea = document.getElementById("searched-text-area");
    const email = document.getElementById("searchedEmail").value;

    const postMessageBody = {
        recipient: email,
        content: textArea.value
    }

    const postMessageRequest = new XMLHttpRequest();
    postMessageRequest.open("POST", "/post-message", true);
    postMessageRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    postMessageRequest.setRequestHeader("token", tokenValue);
    postMessageRequest.send(JSON.stringify(postMessageBody));
    postMessageRequest.onreadystatechange = function() {
        if (postMessageRequest.readyState == 4) {
            if (postMessageRequest.status == 201) {
                textArea.value = "";
                displaySearchedUserPostWall();
            }
        }
    }

}

var displayUserPostWall = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);

    const getUserMessagesRequest = new XMLHttpRequest();
    getUserMessagesRequest.open("GET", "/get-user-messages-by-token", true);
    getUserMessagesRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    getUserMessagesRequest.setRequestHeader("token", tokenValue);
    getUserMessagesRequest.send();
    getUserMessagesRequest.onreadystatechange = function() {
        if (getUserMessagesRequest.readyState == 4) {
            if (getUserMessagesRequest.status == 200) {
                const response = JSON.parse(getUserMessagesRequest.response);
                const postWall = document.getElementById("post-wall");

                postWall.innerHTML = "";

                for (let i = response.messages.length - 1; i >= 0 ; i--) {
                    postWall.innerHTML +=
                        `<br><b><div style="color:red">${response.messages[i].writer}</b></div> ${response.messages[i].content}<br>`;
                }
            }
        }
    }
}

var displaySearchedUserPostWall = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);
    const email = document.getElementById("searchedEmail").value;
    const getUserMessagesRequest = new XMLHttpRequest();

    getUserMessagesRequest.open("GET", "/get-user-messages-by-email/" + email, true);
    getUserMessagesRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    getUserMessagesRequest.setRequestHeader("token", tokenValue);
    getUserMessagesRequest.send();
    getUserMessagesRequest.onreadystatechange = function() {
        if (getUserMessagesRequest.readyState == 4) {
            if (getUserMessagesRequest.status == 200) {
                const response = JSON.parse(getUserMessagesRequest.response);
                const postWall = document.getElementById("searched-post-wall");

                postWall.innerHTML = "";

                for (let i = response.messages.length - 1; i >= 0 ; i--) {
                    postWall.innerHTML +=
                        `<br><b><div style="color:red">${response.messages[i].writer}</b></div> ${response.messages[i].content}<br>`;
                }
            }
        }
    }
}

//*** Tabs ***
var displayHomeTab = function() {
    const homeTab = document.getElementById("home-tab");

    clearTabs();
    setActiveButton(tabs.home);
    setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.home);

    homeTab.style.display = displayProperty.block;

    displayUserProfile();
}
    
var displayAccountTab = function() {
    const accountTab = document.getElementById("account-tab");

    clearTabs();
    setActiveButton(tabs.account);
    setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.account);

    accountTab.style.display = displayProperty.block;
}
    
var displayBrowseTab = function() {
    const browseTab = document.getElementById("browse-tab");

    clearTabs();
    setActiveButton(tabs.browse);
    setLocalStorageValue(localStorageKey.lastOpenedTab, tabs.browse);

    browseTab.style.display = displayProperty.block;
}
    
var clearTabs = function() {
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

var setActiveButton = function(tabName) {
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

//*** Local storage ***
setLocalStorageValue = function(key, stringValue) {
    localStorage.removeItem(key);
    localStorage.setItem(key, stringValue);
}

clearLocalStorage = function() {
    localStorage.removeItem(localStorageKey.token);
    localStorage.removeItem(localStorageKey.lastOpenedTab);
}

//*** Web socket ***
manageSocket = function() {
    const tokenValue = localStorage.getItem(localStorageKey.token);

    socket = io.connect('http://localhost:5000');

    socket.on('close-connection', function(msg) {
        signOut(msg.data, false);
    });

    socket.on('acknowledge-connection', function() {
        socket.emit('handle-user-connection', {"data": tokenValue})
    });
}