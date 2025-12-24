"""
__init__.py - Pages Package
KosManager Automated Testing
"""
from .base_page import BasePage
from .auth_pages import LoginPage, RegisterPage
from .dashboard_pages import LandingPage, DashboardPage, PropertiesPage, NewPropertyPage
from .locators import *

__all__ = [
    'BasePage',
    'LoginPage',
    'RegisterPage', 
    'LandingPage',
    'DashboardPage',
    'PropertiesPage',
    'NewPropertyPage',
]
