const minPasswordLength = 6;
const maxPasswordLength = 12;

function validateSignInCredentials(formData) {
    let emailString = formData.signInEmail.value;
    let passwordString = formData.signInPassword.value;

    //Checks if fields are empty
    if (emailString === "") {
        alert("Email field is empty in the sign in form");
        return;
    }
    else if (passwordString === "") {
        alert("Password field is empty in the sign in form");
        return;
    }

    if (!isEmailInCorrectFormat(emailString)) {
        alert("Email has an incorrect format, sample correct format: abc@gmail.com");
        return;
    };

    //Checks if password has the correct length
    if (passwordString.length < minPasswordLength || passwordString.length > maxPasswordLength) {
        alert(`Password is of length ${passwordString.length}, allowed lengths: min = ${minPasswordLength} and max = ${maxPasswordLength}`);
        return;
    }
}

function validateSignUpCredentials(formData) {
    //Variable that refers to the function itself
    const functionObj = this;
    //Variable containing all fields in the form
    let formFields = formData.querySelectorAll("input");
    let passwordString = formFields[6].value;
    let repeatedPasswordString = formFields[7].value;

    //Loop that iterates over all form fields except for the submit button
    for (let i = 0; i < formFields.length - 1; i++) {
        if (formFields[i].value === "") {
            alert("There should be no empty field in the sign up form");
            return functionObj;
        }
    }
    
    //Checks if the password and repeated password is the same
    if (!passwordString === repeatedPasswordString) {
        alert("Password and repeated password should be the same");
        return;
    }
}

function isEmailInCorrectFormat(emailString) {
    emailRegex = new RegExp(
        "[a-zA-Z0-9+._%-+]{1,256}" +
        "@" +
        "[a-zA-Z0-9][a-zA-Z0-9-]{0,64}" +
        "(" +
        "." +
        "[a-zA-Z0-9][a-zA-Z0-9-]{0,25}" +
        ")+"
    );
    
    //Checks if email has an incorrect format
    if (!emailRegex.test(emailString)) {
        return false;
    }

    return true;
}
