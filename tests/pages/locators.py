"""
locators.py - Page Locators using Page Object Model
KosManager Automated Testing
"""
from selenium.webdriver.common.by import By


class LandingPageLocators:
    """Locators for Landing Page elements."""
    
    # Header
    LOGO = (By.CSS_SELECTOR, "header a[href='/']")
    BTN_LOGIN = (By.CSS_SELECTOR, "header a[href='/login']")
    BTN_REGISTER = (By.CSS_SELECTOR, "header a[href='/register']")
    
    # Hero Section
    HERO_TITLE = (By.CSS_SELECTOR, "h1")
    HERO_SUBTITLE = (By.CSS_SELECTOR, "section p")
    BTN_CTA_REGISTER = (By.CSS_SELECTOR, "section a[href='/register']")
    
    # Features Section
    FEATURE_CARDS = (By.CSS_SELECTOR, "section .grid > div")
    
    # Footer
    FOOTER = (By.TAG_NAME, "footer")


class RegisterPageLocators:
    """Locators for Registration Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    INPUT_NAME = (By.ID, "fullName")
    INPUT_EMAIL = (By.ID, "email")
    INPUT_PASSWORD = (By.ID, "password")
    INPUT_CONFIRM_PASSWORD = (By.ID, "confirmPassword")
    BTN_REGISTER = (By.CSS_SELECTOR, "button[type='submit']")
    LINK_LOGIN = (By.CSS_SELECTOR, "a[href='/login']")
    
    # Error messages
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".text-destructive")
    TOAST_SUCCESS = (By.CSS_SELECTOR, "[data-sonner-toast]")


class LoginPageLocators:
    """Locators for Login Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    INPUT_EMAIL = (By.ID, "email")
    INPUT_PASSWORD = (By.ID, "password")
    BTN_LOGIN = (By.CSS_SELECTOR, "button[type='submit']")
    LINK_REGISTER = (By.CSS_SELECTOR, "a[href='/register']")
    LINK_FORGOT_PASSWORD = (By.CSS_SELECTOR, "a[href='/forgot-password']")
    
    # Error messages
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".text-destructive")
    TOAST_ERROR = (By.CSS_SELECTOR, "[data-sonner-toast][data-type='error']")


class DashboardPageLocators:
    """Locators for Dashboard Page elements."""
    
    # Header - Avatar is the button with user name/initials
    USER_AVATAR = (By.XPATH, "//header//button[contains(@id, 'radix') or contains(., 'User')]")
    GREETING = (By.XPATH, "//h2[contains(text(),'Halo')] | //p[contains(text(),'Halo')]")
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    
    # Stats Cards - more specific selector
    STATS_CARDS = (By.XPATH, "//div[contains(@class,'rounded')]//p[contains(text(),'Total') or contains(text(),'Kamar') or contains(text(),'Penyewa') or contains(text(),'Tagihan')]/parent::div")
    STAT_PROPERTIES = (By.XPATH, "//p[contains(text(),'Total Properti')]/preceding-sibling::p")
    STAT_ROOMS = (By.XPATH, "//p[contains(text(),'Kamar Terisi')]/preceding-sibling::p")
    STAT_TENANTS = (By.XPATH, "//p[contains(text(),'Total Penyewa')]/preceding-sibling::p")
    STAT_INVOICES = (By.XPATH, "//p[contains(text(),'Tagihan Belum Lunas')]/preceding-sibling::p")
    
    # Sidebar Navigation
    SIDEBAR = (By.CSS_SELECTOR, "aside")
    NAV_DASHBOARD = (By.CSS_SELECTOR, "a[href='/dashboard']")
    NAV_PROPERTIES = (By.CSS_SELECTOR, "a[href='/dashboard/properties']")
    NAV_TENANTS = (By.CSS_SELECTOR, "a[href='/dashboard/tenants']")
    NAV_INVOICES = (By.CSS_SELECTOR, "a[href='/dashboard/invoices']")
    NAV_SETTINGS = (By.CSS_SELECTOR, "a[href='/dashboard/settings']")
    
    # Actions
    BTN_ADD_PROPERTY = (By.CSS_SELECTOR, "a[href='/dashboard/properties/new']")
    
    # User Dropdown
    DROPDOWN_MENU = (By.CSS_SELECTOR, "[role='menu']")
    MENU_PROFILE = (By.XPATH, "//div[@role='menuitem' and contains(text(),'Profil')]")
    MENU_SETTINGS = (By.XPATH, "//div[@role='menuitem' and contains(text(),'Pengaturan')]")
    MENU_LOGOUT = (By.XPATH, "//div[@role='menuitem' and contains(text(),'Keluar')]")


class PropertiesPageLocators:
    """Locators for Properties Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    BTN_ADD_PROPERTY = (By.CSS_SELECTOR, "a[href='/dashboard/properties/new']")
    PROPERTY_CARDS = (By.CSS_SELECTOR, "a[href*='/dashboard/properties/']")
    EMPTY_STATE = (By.CSS_SELECTOR, ".border-dashed")
    
    # Property Card Elements
    PROPERTY_NAME = (By.CSS_SELECTOR, "h3")
    PROPERTY_ADDRESS = (By.CSS_SELECTOR, "p.text-muted-foreground")


class NewPropertyPageLocators:
    """Locators for New Property Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h2, h1")
    INPUT_NAME = (By.ID, "name")
    INPUT_ADDRESS = (By.ID, "address")
    BTN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    BTN_CANCEL = (By.CSS_SELECTOR, "button[type='button']")
    LINK_BACK = (By.CSS_SELECTOR, "a[href='/dashboard/properties']")


class PropertyDetailPageLocators:
    """Locators for Property Detail Page elements."""
    
    PROPERTY_NAME = (By.CSS_SELECTOR, "h1")
    PROPERTY_ADDRESS = (By.CSS_SELECTOR, "p.text-muted-foreground")
    BTN_ADD_ROOM = (By.CSS_SELECTOR, "button:has-text('Tambah Kamar')")
    BTN_DELETE = (By.CSS_SELECTOR, "button.text-destructive")
    ROOM_CARDS = (By.CSS_SELECTOR, ".grid > div[class*='card']")
    STATS_TOTAL = (By.XPATH, "//p[contains(text(),'Total Kamar')]/preceding-sibling::p")


class TenantsPageLocators:
    """Locators for Tenants Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    BTN_CHECKIN = (By.CSS_SELECTOR, "a[href='/dashboard/tenants/new']")
    TENANT_CARDS = (By.CSS_SELECTOR, ".grid > div[class*='card']")
    EMPTY_STATE = (By.CSS_SELECTOR, ".border-dashed")
    STAT_ACTIVE = (By.XPATH, "//p[contains(text(),'Penyewa Aktif')]/preceding-sibling::p")


class NewTenantPageLocators:
    """Locators for New Tenant (Check-in) Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h2")
    SELECT_ROOM = (By.CSS_SELECTOR, "button[role='combobox']")
    INPUT_NAME = (By.ID, "name")
    INPUT_PHONE = (By.ID, "phoneNumber")
    INPUT_START_DATE = (By.ID, "startDate")
    SELECT_DUE_DATE = (By.CSS_SELECTOR, "button[role='combobox']:nth-of-type(2)")
    BTN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")


class InvoicesPageLocators:
    """Locators for Invoices/Billing Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    BTN_CREATE_INVOICE = (By.CSS_SELECTOR, "button:has-text('Buat Tagihan')")
    INVOICE_CARDS = (By.CSS_SELECTOR, ".grid > div[class*='card']")
    EMPTY_STATE = (By.CSS_SELECTOR, ".border-dashed")
    
    # Stats
    STAT_UNPAID = (By.XPATH, "//p[contains(text(),'Belum Lunas')]/preceding-sibling::p")
    STAT_PAID = (By.XPATH, "//p[contains(text(),'Lunas')]/preceding-sibling::p")
    
    # Invoice Actions
    BTN_SEND_REMINDER = (By.CSS_SELECTOR, "button:has-text('Kirim Reminder')")
    BTN_MARK_PAID = (By.XPATH, "//div[@role='menuitem' and contains(text(),'Tandai Lunas')]")


class SettingsPageLocators:
    """Locators for Settings Page elements."""
    
    PAGE_TITLE = (By.CSS_SELECTOR, "h1")
    USER_NAME = (By.CSS_SELECTOR, "h3, [class*='CardTitle']")
    USER_EMAIL = (By.CSS_SELECTOR, "[class*='CardDescription']")
    SUBSCRIPTION_BADGE = (By.CSS_SELECTOR, "[class*='badge']")
