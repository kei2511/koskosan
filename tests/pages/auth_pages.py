"""
auth_pages.py - Authentication Page Objects
KosManager Automated Testing
"""
from .base_page import BasePage
from .locators import LoginPageLocators, RegisterPageLocators


class LoginPage(BasePage):
    """
    Page Object for Login Page (/login)
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver, base_url)
        self.locators = LoginPageLocators
    
    def open(self):
        """Navigate to login page."""
        super().open("/login")
        return self
    
    def enter_email(self, email):
        """Enter email address."""
        self.type_text(self.locators.INPUT_EMAIL, email)
        return self
    
    def enter_password(self, password):
        """Enter password."""
        self.type_text(self.locators.INPUT_PASSWORD, password)
        return self
    
    def click_login(self):
        """Click login button."""
        self.click(self.locators.BTN_LOGIN)
        return self
    
    def login(self, email, password):
        """Complete login flow."""
        self.enter_email(email)
        self.enter_password(password)
        self.click_login()
        return self
    
    def get_page_title(self):
        """Get page title text."""
        return self.get_text(self.locators.PAGE_TITLE)
    
    def get_error_message(self):
        """Get error message if present."""
        if self.is_element_visible(self.locators.ERROR_MESSAGE, timeout=3):
            return self.get_text(self.locators.ERROR_MESSAGE)
        return None
    
    def is_login_form_displayed(self):
        """Check if login form is displayed."""
        return (self.is_element_visible(self.locators.INPUT_EMAIL) and
                self.is_element_visible(self.locators.INPUT_PASSWORD))
    
    def click_register_link(self):
        """Click link to registration page."""
        self.click(self.locators.LINK_REGISTER)
        return self


class RegisterPage(BasePage):
    """
    Page Object for Registration Page (/register)
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver, base_url)
        self.locators = RegisterPageLocators
    
    def open(self):
        """Navigate to registration page."""
        super().open("/register")
        self.wait(1)  # Wait for page to fully load
        return self
    
    def enter_name(self, name):
        """Enter full name."""
        self.type_text(self.locators.INPUT_NAME, name)
        return self
    
    def enter_email(self, email):
        """Enter email address."""
        self.type_text(self.locators.INPUT_EMAIL, email)
        return self
    
    def enter_password(self, password):
        """Enter password."""
        self.type_text(self.locators.INPUT_PASSWORD, password)
        return self
    
    def enter_confirm_password(self, password):
        """Enter password confirmation."""
        self.type_text(self.locators.INPUT_CONFIRM_PASSWORD, password)
        return self
    
    def click_register(self):
        """Click register button."""
        self.click(self.locators.BTN_REGISTER)
        return self
    
    def register(self, name, email, password, confirm_password=None):
        """Complete registration flow."""
        if confirm_password is None:
            confirm_password = password
        
        self.enter_name(name)
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(confirm_password)
        self.click_register()
        return self
    
    def get_page_title(self):
        """Get page title text."""
        return self.get_text(self.locators.PAGE_TITLE)
    
    def get_error_message(self):
        """Get error message if present."""
        if self.is_element_visible(self.locators.ERROR_MESSAGE, timeout=3):
            return self.get_text(self.locators.ERROR_MESSAGE)
        return None
    
    def is_registration_form_displayed(self):
        """Check if registration form is displayed."""
        return (self.is_element_visible(self.locators.INPUT_NAME, timeout=5) and
                self.is_element_visible(self.locators.INPUT_EMAIL, timeout=5) and
                self.is_element_visible(self.locators.INPUT_PASSWORD, timeout=5))
    
    def click_login_link(self):
        """Click link to login page."""
        self.click(self.locators.LINK_LOGIN)
        return self
