const signInSubmitButton = document.getElementById("signInSubmit");
const signUpSubmitButton = document.getElementById("signUpSubmit");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");

const formHandler = new FormHandler();

signInSubmitButton.addEventListener("click", function() {
    formHandler.validateSignInForm(signInForm);
});

signUpSubmitButton.addEventListener("click", function() {
    formHandler.validateSignUpForm(signUpForm);
});

