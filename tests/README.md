# KosManager - Automated Testing Guide

## 📋 Daftar Isi
1. [Struktur Testing](#struktur-testing)
2. [Instalasi](#instalasi)
3. [Menjalankan Test](#menjalankan-test)
4. [Test Cases](#test-cases)
5. [Page Object Model](#page-object-model)
6. [HTML Report](#html-report)
7. [Best Practices](#best-practices)

---

## 📁 Struktur Testing

```
tests/
├── conftest.py              # Pytest fixtures & configuration
├── pytest.ini               # Pytest settings
├── requirements.txt         # Python dependencies
├── TEST_CASES.md           # Dokumentasi test cases
│
├── pages/                   # Page Object Model
│   ├── __init__.py
│   ├── base_page.py        # Base class dengan helper methods
│   ├── locators.py         # Semua element locators
│   ├── auth_pages.py       # Login & Register pages
│   └── dashboard_pages.py  # Dashboard & Properties pages
│
├── test_01_landing_page.py  # Landing page tests
├── test_02_authentication.py # Register & Login tests
├── test_03_dashboard.py     # Dashboard tests
├── test_04_properties.py    # Property management tests
├── test_05_logout.py        # Logout tests
│
└── reports/                 # Test reports (generated)
    ├── report.html
    └── screenshots/
```

---

## ⚙️ Instalasi

### Prerequisites
- Python 3.8+
- Google Chrome browser
- Node.js (untuk menjalankan aplikasi)

### Setup

1. **Install Python dependencies:**
```bash
cd tests
pip install -r requirements.txt
```

2. **Atau buat virtual environment (recommended):**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r tests/requirements.txt
```

3. **Pastikan aplikasi berjalan:**
```bash
npm run dev
# Aplikasi harus berjalan di http://localhost:3000
```

---

## 🚀 Menjalankan Test

### Menggunakan Script (Recommended)
```bash
# Windows
run_tests.bat           # Jalankan semua test
run_tests.bat smoke     # Jalankan smoke test saja
run_tests.bat auth      # Jalankan auth test saja
run_tests.bat property  # Jalankan property test saja
```

### Menggunakan Pytest Langsung
```bash
# Semua test
pytest tests/ --html=tests/reports/report.html --self-contained-html

# Dengan marker tertentu
pytest tests/ -m smoke --html=tests/reports/report_smoke.html
pytest tests/ -m auth --html=tests/reports/report_auth.html
pytest tests/ -m regression --html=tests/reports/report_regression.html

# Test file spesifik
pytest tests/test_02_authentication.py --html=tests/reports/report.html

# Test function spesifik
pytest tests/test_02_authentication.py::TestLogin::test_TC003_02_login_valid_credentials

# Verbose mode
pytest tests/ -v

# Parallel execution (requires pytest-xdist)
pytest tests/ -n 2
```

### Headless Mode
Edit `conftest.py` dan uncomment:
```python
chrome_options.add_argument("--headless")
```

---

## 📝 Test Cases

### Markers
| Marker | Deskripsi |
|--------|-----------|
| `@pytest.mark.smoke` | Quick smoke tests |
| `@pytest.mark.regression` | Full regression suite |
| `@pytest.mark.auth` | Authentication tests |
| `@pytest.mark.property` | Property management tests |
| `@pytest.mark.tenant` | Tenant management tests |
| `@pytest.mark.invoice` | Billing/invoice tests |

### Test Case Structure
```python
def test_TC001_01_landing_page_loads(self, driver, base_url):
    """
    TC001-01: Verify landing page loads successfully.
    
    Steps:
    1. Open landing page
    
    Expected: Page loads with title containing "KosManager"
    """
    # Test implementation
```

---

## 🏗️ Page Object Model

### Base Page
```python
from pages import BasePage

class MyPage(BasePage):
    def __init__(self, driver, base_url):
        super().__init__(driver, base_url)
    
    def my_action(self):
        self.click(MyLocators.BUTTON)
        return self
```

### Available Methods (BasePage)
| Method | Deskripsi |
|--------|-----------|
| `open(path)` | Navigate to URL |
| `find_element(locator)` | Find single element |
| `find_elements(locator)` | Find multiple elements |
| `click(locator)` | Click element |
| `type_text(locator, text)` | Type into input |
| `get_text(locator)` | Get element text |
| `wait_for_element(locator)` | Wait for element visible |
| `wait_for_url_contains(text)` | Wait for URL change |
| `is_element_visible(locator)` | Check visibility |
| `scroll_to_element(locator)` | Scroll to element |
| `take_screenshot(name)` | Save screenshot |

### Locators
```python
from selenium.webdriver.common.by import By

class LoginPageLocators:
    INPUT_EMAIL = (By.ID, "email")
    INPUT_PASSWORD = (By.ID, "password")
    BTN_LOGIN = (By.CSS_SELECTOR, "button[type='submit']")
```

---

## 📊 HTML Report

Setelah test selesai, buka report di:
```
tests/reports/report.html
```

### Report Features:
- ✅ Test results summary
- 📸 Screenshots on failure
- ⏱️ Execution time
- 📋 Test case details
- 🔍 Filtering by passed/failed/skipped

---

## ✨ Best Practices

### 1. Test Independence
- Setiap test harus bisa berjalan sendiri
- Gunakan fixtures untuk setup/teardown

### 2. Naming Convention
```
test_[TestCaseID]_[description]
test_TC001_01_landing_page_loads
```

### 3. Assertions
```python
# Good - descriptive message
assert "KosManager" in title, f"Expected 'KosManager' in title, got: {title}"

# Bad - no message
assert "KosManager" in title
```

### 4. Wait Strategy
```python
# Good - explicit wait
self.wait_for_element(locator)

# Bad - hard sleep
time.sleep(5)
```

### 5. Page Object Pattern
```python
# Good - action returns self for chaining
login_page.enter_email(email).enter_password(password).click_login()

# Bad - multiple separate calls
login_page.enter_email(email)
login_page.enter_password(password)
login_page.click_login()
```

---

## 🐛 Troubleshooting

### Chrome Driver Issues
```bash
# WebDriver Manager akan otomatis download driver
# Jika error, coba update:
pip install --upgrade webdriver-manager
```

### Element Not Found
1. Periksa locator di `locators.py`
2. Tambahkan explicit wait
3. Pastikan element visible di viewport

### Timeout Errors
```python
# Increase timeout di BasePage
self.timeout = 20  # default 10
```

---

## 📚 Resources

- [Selenium Documentation](https://selenium-python.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [pytest-html](https://pytest-html.readthedocs.io/)
- [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)
