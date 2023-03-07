from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
import unittest
import time

#Tests require to have a TestUser created in a database
class SeleniumTests(unittest.TestCase):
    def setUp(self):
        self.source = "http://127.0.0.1:5000/static/client.html"
        self.driver_file = "./msedgedriver.exe"
        self.service = Service(executable_path=self.driver_file)
        self.webdriver = webdriver.Edge(service=self.service)
        self.webdriver.get(self.source)

    #Test 1 - Welcome view
    def test_webpage_title(self):
        print("Running Test 1")
        self.assertEqual(self.webdriver.title, "Twidder")
        time.sleep(3)

    #Test 2 - Welcome view
    def test_sign_up_different_passwords(self):
        print("Running Test 2")
        test_user = TestUser()

        time.sleep(2)
        self.webdriver.find_element(By.ID, "firstName").send_keys(test_user.first_name)
        self.webdriver.find_element(By.ID, "familyName").send_keys(test_user.family_name)
        self.webdriver.find_element(By.ID, "gender").send_keys(test_user.gender)
        self.webdriver.find_element(By.ID, "city").send_keys(test_user.city)
        self.webdriver.find_element(By.ID, "country").send_keys(test_user.country)
        self.webdriver.find_element(By.ID, "signUpEmail").send_keys(test_user.email)
        self.webdriver.find_element(By.ID, "signUpPassword").send_keys(test_user.password)
        self.webdriver.find_element(By.ID, "repeatedSignUpPassword").send_keys("gibberish")
        self.webdriver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        self.webdriver.find_element(By.ID, "btn-sign-up").click()
        time.sleep(4)

        status_error_message_text = self.webdriver.find_element(By.ID, "welcome-view-status-message").text
        self.assertEqual(status_error_message_text, "Password and the repeated password are not the same")

    #Test 3 - Welcome view
    def test_sign_in_too_short_password(self):
        print("Running Test 3")
        test_user = TestUser()

        self.webdriver.find_element(By.ID, "signInEmail").send_keys(test_user.email)
        self.webdriver.find_element(By.ID, "signInPassword").send_keys("abc")
        time.sleep(2)
        self.webdriver.find_element(By.ID, "btn-sign-in").click()
        time.sleep(4)

        status_error_message_text = self.webdriver.find_element(By.ID, "welcome-view-status-message").text
        self.assertEqual(status_error_message_text, "Incorrect password length, allowed min length = 6")

    #Test 4 - Home tab
    def test_user_data_displayed(self):
        print("Running Test 4")
        test_user = TestUser()
        self.__sign_in()

        email_value = self.webdriver.find_element(By.ID, "email-value")
        first_name_value = self.webdriver.find_element(By.ID, "firstname-value")
        family_name_value = self.webdriver.find_element(By.ID, "familyname-value")
        gender_value = self.webdriver.find_element(By.ID, "gender-value")
        city_value = self.webdriver.find_element(By.ID, "city-value")
        country_value = self.webdriver.find_element(By.ID, "country-value")

        time.sleep(4)

        self.assertTrue(email_value.text.__contains__(test_user.email))
        self.assertTrue(first_name_value.text.__contains__(test_user.first_name))
        self.assertTrue(family_name_value.text.__contains__(test_user.family_name))
        self.assertTrue(gender_value.text.__contains__(test_user.gender))
        self.assertTrue(city_value.text.__contains__(test_user.city))
        self.assertTrue(country_value.text.__contains__(test_user.country))

        self.__sign_out()

    #Test 5 - Account tab
    def test_password_change_incorrect_current_password(self):
        print("Running Test 5")
        self.__sign_in()

        self.webdriver.find_element(By.ID, "btn-account-tab").click()
        self.webdriver.find_element(By.ID, "oldPassword").send_keys("gibberish")
        self.webdriver.find_element(By.ID, "newPassword").send_keys("abcdefghijk")
        self.webdriver.find_element(By.ID, "repeatedNewPassword").send_keys("abcdefghijk")

        time.sleep(2)
        self.webdriver.find_element(By.ID, "btn-change-password").click()
        time.sleep(4)

        status_error_message_text = self.webdriver.find_element(By.ID, "profile-view-status-message").text
        self.assertEqual(status_error_message_text, "Incorrect password input(s): incorrect old password or the new password is the same as the old")

        self.__sign_out()

    #Test 6 - Browse tab
    def test_searched_user_does_not_exist(self):
        print("Running Test 6")
        self.__sign_in()

        self.webdriver.find_element(By.ID, "btn-browse-tab").click()
        self.webdriver.find_element(By.ID, "searchedEmail").send_keys("gibberish@gibberish.gibberish")

        time.sleep(2)
        self.webdriver.find_element(By.ID, "btn-browse-messages").click()
        time.sleep(4)
        
        status_error_message_text = self.webdriver.find_element(By.ID, "profile-view-status-message").text
        self.assertEqual(status_error_message_text, "User not found")

        self.__sign_out()

    def __sign_in(self):
        test_user = TestUser()

        self.webdriver.find_element(By.ID, "signInEmail").send_keys(test_user.email)
        self.webdriver.find_element(By.ID, "signInPassword").send_keys(test_user.password)

        time.sleep(2)
        self.webdriver.find_element(By.ID, "btn-sign-in").click()
        time.sleep(3)

    def __sign_out(self):
        time.sleep(2)
        self.webdriver.find_element(By.ID, "btn-account-tab").click()
        self.webdriver.find_element(By.ID, "btn-sign-out").click()

    def tearDown(self):
        self.webdriver.quit()

class TestUser:
    def __init__(self):
        self.first_name = "John"
        self.family_name = "Smith"
        self.gender = "Male"
        self.city = "Glasgow"
        self.country = "Scotland"
        self.email = "test@gmail.com"
        self.password = "abcdefgh"
        
if __name__ == "__main__":
    unittest.main()