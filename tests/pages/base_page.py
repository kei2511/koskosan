"""
base_page.py - Base Page Object Class
KosManager Automated Testing
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time


class BasePage:
    """
    Base class for all Page Objects.
    Contains common methods used across all pages.
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        self.driver = driver
        self.base_url = base_url
        self.timeout = 10
    
    def open(self, path=""):
        """Navigate to a specific path."""
        url = f"{self.base_url}{path}"
        self.driver.get(url)
        return self
    
    def get_current_url(self):
        """Get current page URL."""
        return self.driver.current_url
    
    def get_title(self):
        """Get page title."""
        return self.driver.title
    
    def find_element(self, locator):
        """Find a single element."""
        return self.driver.find_element(*locator)
    
    def find_elements(self, locator):
        """Find multiple elements."""
        return self.driver.find_elements(*locator)
    
    def wait_for_element(self, locator, timeout=None):
        """Wait for element to be visible."""
        timeout = timeout or self.timeout
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_element_located(locator))
    
    def wait_for_element_clickable(self, locator, timeout=None):
        """Wait for element to be clickable."""
        timeout = timeout or self.timeout
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.element_to_be_clickable(locator))
    
    def wait_for_url_contains(self, text, timeout=None):
        """Wait for URL to contain specific text."""
        timeout = timeout or self.timeout
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.url_contains(text))
    
    def wait_for_text_in_element(self, locator, text, timeout=None):
        """Wait for specific text in element."""
        timeout = timeout or self.timeout
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.text_to_be_present_in_element(locator, text))
    
    def click(self, locator):
        """Click on an element."""
        element = self.wait_for_element_clickable(locator)
        element.click()
        return self
    
    def type_text(self, locator, text, clear_first=True):
        """Type text into an input field."""
        element = self.wait_for_element(locator)
        if clear_first:
            element.clear()
        element.send_keys(text)
        return self
    
    def get_text(self, locator):
        """Get text from an element."""
        element = self.wait_for_element(locator)
        return element.text
    
    def get_attribute(self, locator, attribute):
        """Get attribute value from an element."""
        element = self.wait_for_element(locator)
        return element.get_attribute(attribute)
    
    def is_element_visible(self, locator, timeout=3):
        """Check if element is visible."""
        try:
            self.wait_for_element(locator, timeout)
            return True
        except TimeoutException:
            return False
    
    def is_element_present(self, locator):
        """Check if element is present in DOM."""
        try:
            self.find_element(locator)
            return True
        except NoSuchElementException:
            return False
    
    def hover(self, locator):
        """Hover over an element."""
        element = self.wait_for_element(locator)
        ActionChains(self.driver).move_to_element(element).perform()
        return self
    
    def scroll_to_element(self, locator):
        """Scroll element into view."""
        element = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)
        return self
    
    def scroll_to_bottom(self):
        """Scroll to bottom of page."""
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        return self
    
    def scroll_to_top(self):
        """Scroll to top of page."""
        self.driver.execute_script("window.scrollTo(0, 0);")
        return self
    
    def take_screenshot(self, name):
        """Take a screenshot."""
        self.driver.save_screenshot(f"tests/reports/screenshots/{name}.png")
        return self
    
    def wait(self, seconds):
        """Explicit wait (use sparingly)."""
        time.sleep(seconds)
        return self
    
    def refresh(self):
        """Refresh current page."""
        self.driver.refresh()
        return self
    
    def go_back(self):
        """Navigate back."""
        self.driver.back()
        return self
    
    def accept_alert(self):
        """Accept browser alert."""
        self.driver.switch_to.alert.accept()
        return self
    
    def dismiss_alert(self):
        """Dismiss browser alert."""
        self.driver.switch_to.alert.dismiss()
        return self
