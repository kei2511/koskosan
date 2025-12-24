"""
test_02_authentication.py - Authentication Tests
KosManager Automated Testing

Test Cases: TC002, TC003
"""
import pytest
from pages import LoginPage, RegisterPage, DashboardPage


@pytest.mark.auth
class TestRegistration:
    """Test suite for User Registration functionality."""
    
    @pytest.fixture(autouse=True)
    def clear_before_test(self, clear_session):
        """Clear cookies before each registration test."""
        pass
    
    def test_TC002_01_registration_form_displayed(self, driver, base_url):
        """
        TC002-01: Verify registration form is displayed.
        
        Steps:
        1. Open /register
        
        Expected: Form with name, email, password, confirm password fields
        """
        register = RegisterPage(driver, base_url)
        register.open()
        
        assert register.is_registration_form_displayed(), \
            "Registration form should be displayed"
        
        page_title = register.get_page_title()
        assert "Akun" in page_title or "Daftar" in page_title, \
            f"Page title should contain 'Akun' or 'Daftar', got: {page_title}"
    
    def test_TC002_02_register_valid_data(self, driver, base_url, unique_email):
        """
        TC002-02: Register with valid data.
        
        Steps:
        1. Open /register
        2. Fill all fields with valid data
        3. Click "Daftar"
        
        Expected: Redirect to login page
        """
        register = RegisterPage(driver, base_url)
        register.open()
        
        # Use unique email to avoid duplicate
        register.register(
            name="Test Automation User",
            email=unique_email,
            password="SecurePassword123"
        )
        
        # Wait for redirect
        register.wait(2)
        
        # Should redirect to login
        assert "/login" in driver.current_url, \
            f"Expected redirect to /login, current URL: {driver.current_url}"
    
    def test_TC002_04_register_password_mismatch(self, driver, base_url, unique_email):
        """
        TC002-04: Register with password mismatch.
        
        Steps:
        1. Open /register
        2. Enter different passwords
        3. Click "Daftar"
        
        Expected: Error message "Password tidak sama"
        """
        register = RegisterPage(driver, base_url)
        register.open()
        
        register.register(
            name="Test User",
            email=unique_email,
            password="Password123",
            confirm_password="DifferentPassword123"
        )
        
        register.wait(1)
        
        # Check for error - should still be on register page
        assert "/register" in driver.current_url, \
            "Should stay on register page when passwords don't match"
    
    def test_TC002_05_register_empty_fields(self, driver, base_url):
        """
        TC002-05: Register with empty fields.
        
        Steps:
        1. Open /register
        2. Click "Daftar" without filling fields
        
        Expected: Validation errors appear
        """
        register = RegisterPage(driver, base_url)
        register.open()
        
        # Click submit without entering data
        register.click_register()
        register.wait(0.5)
        
        # Should stay on register page
        assert "/register" in driver.current_url, \
            "Should stay on register page when fields are empty"


@pytest.mark.auth
class TestLogin:
    """Test suite for User Login functionality."""
    
    @pytest.fixture(autouse=True)
    def clear_before_test(self, clear_session):
        """Clear cookies before each login test."""
        pass
    
    def test_TC003_01_login_form_displayed(self, driver, base_url):
        """
        TC003-01: Verify login form is displayed.
        
        Steps:
        1. Open /login
        
        Expected: Form with email and password fields
        """
        login = LoginPage(driver, base_url)
        login.open()
        
        assert login.is_login_form_displayed(), \
            "Login form should be displayed"
        
        page_title = login.get_page_title()
        assert "Masuk" in page_title or "Login" in page_title, \
            f"Page title should contain 'Masuk' or 'Login', got: {page_title}"
    
    def test_TC003_02_login_valid_credentials(self, driver, base_url, test_user):
        """
        TC003-02: Login with valid credentials.
        
        Steps:
        1. Open /login
        2. Enter valid email and password
        3. Click "Masuk"
        
        Expected: Redirect to dashboard
        
        Note: This test requires a pre-existing test user.
              Use the test_user fixture or create user first.
        """
        login = LoginPage(driver, base_url)
        login.open()
        
        # Try logging in with existing test user (from browser test earlier)
        login.login(
            email="test@example.com",
            password="password123"
        )
        
        # Wait for redirect
        login.wait(2)
        
        # Should redirect to dashboard
        assert "/dashboard" in driver.current_url, \
            f"Expected redirect to /dashboard, current URL: {driver.current_url}"
    
    def test_TC003_03_login_invalid_password(self, driver, base_url):
        """
        TC003-03: Login with wrong password.
        
        Steps:
        1. Open /login
        2. Enter valid email, wrong password
        3. Click "Masuk"
        
        Expected: Error message displayed
        """
        login = LoginPage(driver, base_url)
        login.open()
        
        login.login(
            email="test@example.com",
            password="wrongpassword123"
        )
        
        # Wait for response
        login.wait(2)
        
        # Should stay on login page
        assert "/login" in driver.current_url, \
            "Should stay on login page with invalid credentials"
    
    def test_TC003_04_login_unregistered_email(self, driver, base_url):
        """
        TC003-04: Login with unregistered email.
        
        Steps:
        1. Open /login
        2. Enter non-existent email
        3. Click "Masuk"
        
        Expected: Error message displayed
        """
        login = LoginPage(driver, base_url)
        login.open()
        
        login.login(
            email="nonexistent@example.com",
            password="anypassword123"
        )
        
        # Wait for response
        login.wait(2)
        
        # Should stay on login page
        assert "/login" in driver.current_url, \
            "Should stay on login page with unregistered email"
    
    def test_TC003_05_login_to_register_link(self, driver, base_url):
        """
        TC003-05: Navigate from login to register page.
        
        Steps:
        1. Open /login
        2. Click "Daftar" link
        
        Expected: Redirect to /register
        """
        login = LoginPage(driver, base_url)
        login.open()
        
        login.click_register_link()
        
        login.wait_for_url_contains("/register")
        assert "/register" in driver.current_url, \
            f"Expected redirect to /register, got: {driver.current_url}"
