class FormHandler {
    minPasswordLength = 6
    maxPasswordLength = 12

    validateSignInForm(formData) {
        const passwordString = formData.signInPassword.value;

        if (!this.#isPasswordLengthCorrect(passwordString)) {
            return;
        }
    }
    
    validateSignUpForm(formData) {
        const differentPasswordsMessage = document.getElementById("different-passwords-message");
        const passwordString = formData.signUpPassword.value;
        const repeatedPasswordString = formData.repeatedSignUpPassword.value;
    
        if (!this.#isPasswordLengthCorrect(passwordString) || !this.#isPasswordLengthCorrect(repeatedPasswordString)) {
            return;
        }
        
        //Checks if the password and repeated password is the same
        if (!passwordString === repeatedPasswordString) {
            differentPasswordsMessage.style.display = "block";
            return;
        }
    }
    
    #isPasswordLengthCorrect(passwordString) {
        const incorrectPasswordLengthMessage = document.getElementById("incorrect-password-length-message");

        //Checks if password has the incorrect length
        if (passwordString.length < this.minPasswordLength || passwordString.length > this.maxPasswordLength) {
            incorrectPasswordLengthMessage.style.display = "block";
            incorrectPasswordLengthMessage.textContent += `, allowed lengths: min = ${this.minPasswordLength} and max = ${this.maxPasswordLength}`
            return false;
        }
    
        return true;
    }
}

window.FormHandler = FormHandler;