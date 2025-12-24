"""
dashboard_pages.py - Dashboard Page Objects
KosManager Automated Testing
"""
from .base_page import BasePage
from .locators import (
    DashboardPageLocators, 
    PropertiesPageLocators,
    NewPropertyPageLocators,
    LandingPageLocators
)


class LandingPage(BasePage):
    """
    Page Object for Landing Page (/)
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver, base_url)
        self.locators = LandingPageLocators
    
    def open(self):
        """Navigate to landing page."""
        super().open("/")
        return self
    
    def get_hero_title(self):
        """Get hero section title."""
        return self.get_text(self.locators.HERO_TITLE)
    
    def is_login_button_visible(self):
        """Check if login button is visible."""
        return self.is_element_visible(self.locators.BTN_LOGIN)
    
    def is_register_button_visible(self):
        """Check if register button is visible."""
        return self.is_element_visible(self.locators.BTN_REGISTER)
    
    def click_login(self):
        """Click login button."""
        self.click(self.locators.BTN_LOGIN)
        return self
    
    def click_register(self):
        """Click register button."""
        self.click(self.locators.BTN_REGISTER)
        return self
    
    def get_feature_cards_count(self):
        """Get number of feature cards."""
        return len(self.find_elements(self.locators.FEATURE_CARDS))
    
    def is_footer_visible(self):
        """Check if footer is visible."""
        self.scroll_to_bottom()
        return self.is_element_visible(self.locators.FOOTER)


class DashboardPage(BasePage):
    """
    Page Object for Dashboard Page (/dashboard)
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver, base_url)
        self.locators = DashboardPageLocators
    
    def open(self):
        """Navigate to dashboard."""
        super().open("/dashboard")
        return self
    
    def get_greeting_text(self):
        """Get greeting/title text."""
        # Try to find greeting first, fallback to page title
        if self.is_element_visible(self.locators.GREETING, timeout=2):
            return self.get_text(self.locators.GREETING)
        # Fallback - check page title or H1
        return self.get_text(self.locators.PAGE_TITLE)
    
    def get_stats_cards_count(self):
        """Get number of stats cards."""
        return len(self.find_elements(self.locators.STATS_CARDS))
    
    def is_sidebar_visible(self):
        """Check if sidebar is visible (desktop)."""
        return self.is_element_visible(self.locators.SIDEBAR, timeout=3)
    
    def click_nav_properties(self):
        """Navigate to Properties via sidebar."""
        self.click(self.locators.NAV_PROPERTIES)
        return self
    
    def click_nav_tenants(self):
        """Navigate to Tenants via sidebar."""
        self.click(self.locators.NAV_TENANTS)
        return self
    
    def click_nav_invoices(self):
        """Navigate to Invoices via sidebar."""
        self.click(self.locators.NAV_INVOICES)
        return self
    
    def click_nav_settings(self):
        """Navigate to Settings via sidebar."""
        self.click(self.locators.NAV_SETTINGS)
        return self
    
    def click_add_property(self):
        """Click add property button."""
        self.click(self.locators.BTN_ADD_PROPERTY)
        return self
    
    def click_user_avatar(self):
        """Click user avatar to open dropdown."""
        # Wait for any toast notifications to disappear
        self.wait(1)
        # Use JavaScript click to avoid overlay issues with toast
        try:
            element = self.wait_for_element_clickable(self.locators.USER_AVATAR, timeout=5)
            self.driver.execute_script("arguments[0].click();", element)
        except:
            # Fallback to normal click
            self.click(self.locators.USER_AVATAR)
        return self
    
    def is_dropdown_visible(self):
        """Check if user dropdown is visible."""
        return self.is_element_visible(self.locators.DROPDOWN_MENU, timeout=3)
    
    def click_logout(self):
        """Click logout in dropdown menu."""
        self.click_user_avatar()
        self.wait(0.5)
        self.click(self.locators.MENU_LOGOUT)
        return self


class PropertiesPage(BasePage):
    """
    Page Object for Properties List Page (/dashboard/properties)
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver, base_url)
        self.locators = PropertiesPageLocators
    
    def open(self):
        """Navigate to properties page."""
        super().open("/dashboard/properties")
        return self
    
    def get_page_title(self):
        """Get page title."""
        return self.get_text(self.locators.PAGE_TITLE)
    
    def click_add_property(self):
        """Click add property button."""
        self.click(self.locators.BTN_ADD_PROPERTY)
        return self
    
    def get_property_cards_count(self):
        """Get number of property cards."""
        return len(self.find_elements(self.locators.PROPERTY_CARDS))
    
    def is_empty_state_visible(self):
        """Check if empty state is displayed."""
        return self.is_element_visible(self.locators.EMPTY_STATE, timeout=3)
    
    def click_first_property(self):
        """Click the first property card."""
        cards = self.find_elements(self.locators.PROPERTY_CARDS)
        if cards:
            cards[0].click()
        return self


class NewPropertyPage(BasePage):
    """
    Page Object for New Property Page (/dashboard/properties/new)
    """
    
    def __init__(self, driver, base_url="http://localhost:3000"):
        super().__init__(driver, base_url)
        self.locators = NewPropertyPageLocators
    
    def open(self):
        """Navigate to new property page."""
        super().open("/dashboard/properties/new")
        return self
    
    def enter_name(self, name):
        """Enter property name."""
        self.type_text(self.locators.INPUT_NAME, name)
        return self
    
    def enter_address(self, address):
        """Enter property address."""
        self.type_text(self.locators.INPUT_ADDRESS, address)
        return self
    
    def click_submit(self):
        """Click submit button."""
        self.click(self.locators.BTN_SUBMIT)
        return self
    
    def create_property(self, name, address):
        """Complete create property flow."""
        self.enter_name(name)
        self.enter_address(address)
        self.click_submit()
        return self
    
    def click_cancel(self):
        """Click cancel button."""
        self.click(self.locators.BTN_CANCEL)
        return self
