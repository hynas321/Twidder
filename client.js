function validateSignUpCredentials(formData) {
    let passwordString = formData.signUpPassword.value;
    let repeatedPasswordString = formData.repeatedSignUpPassword.value;
    
    //Checks if the password and repeated password is the same
    if (!passwordString === repeatedPasswordString) {
        alert("Password and repeated password should be the same");
        return;
    }
}
