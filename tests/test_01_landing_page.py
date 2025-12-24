"""
test_01_landing_page.py - Landing Page Tests
KosManager Automated Testing

Test Cases: TC001
"""
import pytest
from pages import LandingPage


@pytest.mark.smoke
class TestLandingPage:
    """Test suite for Landing Page functionality."""
    
    def test_TC001_01_landing_page_loads(self, driver, base_url):
        """
        TC001-01: Verify landing page loads successfully.
        
        Steps:
        1. Open landing page
        
        Expected: Page loads with title containing "KosManager"
        """
        landing = LandingPage(driver, base_url)
        landing.open()
        
        assert "KosManager" in driver.title, \
            f"Expected title to contain 'KosManager', got: {driver.title}"
    
    def test_TC001_02_navigation_buttons_visible(self, driver, base_url):
        """
        TC001-02: Verify navigation buttons are visible.
        
        Steps:
        1. Open landing page
        2. Check "Masuk" and "Daftar Gratis" buttons
        
        Expected: Both buttons are visible
        """
        landing = LandingPage(driver, base_url)
        landing.open()
        
        assert landing.is_login_button_visible(), \
            "Login button should be visible"
        assert landing.is_register_button_visible(), \
            "Register button should be visible"
    
    def test_TC001_03_hero_section_content(self, driver, base_url):
        """
        TC001-03: Verify hero section displays correct content.
        
        Steps:
        1. Open landing page
        2. Check hero title
        
        Expected: Title contains "Kelola Kos" text
        """
        landing = LandingPage(driver, base_url)
        landing.open()
        
        hero_title = landing.get_hero_title()
        assert "Kelola Kos" in hero_title, \
            f"Hero title should contain 'Kelola Kos', got: {hero_title}"
    
    def test_TC001_04_feature_cards_displayed(self, driver, base_url):
        """
        TC001-04: Verify feature cards are displayed.
        
        Steps:
        1. Open landing page
        2. Scroll to features section
        3. Count feature cards
        
        Expected: At least 4 feature cards displayed
        """
        landing = LandingPage(driver, base_url)
        landing.open()
        landing.scroll_to_bottom()
        landing.wait(0.5)
        
        cards_count = landing.get_feature_cards_count()
        assert cards_count >= 4, \
            f"Expected at least 4 feature cards, got: {cards_count}"
    
    def test_TC001_05_login_navigation(self, driver, base_url):
        """
        TC001-05: Verify clicking login navigates to login page.
        
        Steps:
        1. Open landing page
        2. Click "Masuk" button
        
        Expected: Redirected to /login
        """
        landing = LandingPage(driver, base_url)
        landing.open()
        landing.click_login()
        
        landing.wait_for_url_contains("/login")
        assert "/login" in driver.current_url, \
            f"Expected URL to contain '/login', got: {driver.current_url}"
    
    def test_TC001_06_register_navigation(self, driver, base_url):
        """
        TC001-06: Verify clicking register navigates to register page.
        
        Steps:
        1. Open landing page
        2. Click "Daftar Gratis" button
        
        Expected: Redirected to /register
        """
        landing = LandingPage(driver, base_url)
        landing.open()
        landing.click_register()
        
        landing.wait_for_url_contains("/register")
        assert "/register" in driver.current_url, \
            f"Expected URL to contain '/register', got: {driver.current_url}"
