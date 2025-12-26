"""
conftest.py - Pytest Configuration & Fixtures
KosManager Automated Testing
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import os

# Base URL for testing
BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")

# Test user credentials (for testing purposes)
TEST_USER_EMAIL = "testuser@kosmanager.com"
TEST_USER_PASSWORD = "TestPassword123"
TEST_USER_NAME = "Test Automation"


@pytest.fixture(scope="session")
def browser():
    """
    Session-scoped fixture to initialize Chrome WebDriver.
    Browser will be reused across all tests in the session.
    """
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")
    # Uncomment for headless mode
    # chrome_options.add_argument("--headless")
    # chrome_options.add_argument("--no-sandbox")
    # chrome_options.add_argument("--disable-dev-shm-usage")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)
    
    yield driver
    
    # Teardown: close browser after all tests
    driver.quit()


@pytest.fixture(scope="function")
def driver(browser):
    """
    Function-scoped fixture that provides driver and handles cleanup.
    """
    yield browser
    # Note: Don't clear cookies here as some tests depend on session state


@pytest.fixture
def clear_session(browser):
    """
    Fixture to clear all cookies before a test.
    Use this for tests that need a fresh unauthenticated session.
    """
    browser.delete_all_cookies()
    return browser


@pytest.fixture
def base_url():
    """Return the base URL for testing."""
    return BASE_URL


@pytest.fixture
def test_user():
    """Return test user credentials."""
    return {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "name": TEST_USER_NAME
    }


@pytest.fixture
def unique_email():
    """Generate unique email for registration tests."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"test_{timestamp}@kosmanager.com"


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "smoke: Quick smoke tests")
    config.addinivalue_line("markers", "regression: Full regression tests")
    config.addinivalue_line("markers", "auth: Authentication tests")
    config.addinivalue_line("markers", "property: Property management tests")
    config.addinivalue_line("markers", "tenant: Tenant management tests")
    config.addinivalue_line("markers", "invoice: Invoice/billing tests")


def pytest_html_report_title(report):
    """Set custom HTML report title."""
    report.title = "KOMA - Automated Test Report"


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Hook to capture screenshot on test failure.
    """
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver")
        if driver:
            # Create screenshots directory if not exists
            screenshot_dir = os.path.join(os.path.dirname(__file__), "reports", "screenshots")
            os.makedirs(screenshot_dir, exist_ok=True)
            
            # Save screenshot
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = os.path.join(screenshot_dir, f"{item.name}_{timestamp}.png")
            driver.save_screenshot(screenshot_path)
            
            # Attach to report
            if hasattr(report, "extra"):
                report.extra.append(pytest.html.extras.image(screenshot_path))
