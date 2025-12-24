@echo off
REM ==============================================
REM KosManager - Automated Test Runner
REM ==============================================

echo.
echo ========================================
echo  KosManager Automated Testing
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing dependencies...
pip install -r tests\requirements.txt --quiet

REM Create reports directory
if not exist "tests\reports" mkdir tests\reports
if not exist "tests\reports\screenshots" mkdir tests\reports\screenshots

REM Run tests with HTML report
echo.
echo [INFO] Running tests...
echo.

REM Check for command line arguments
if "%1"=="" (
    REM Run all tests
    pytest tests\ --html=tests\reports\report.html --self-contained-html
) else if "%1"=="smoke" (
    REM Run smoke tests only
    pytest tests\ -m smoke --html=tests\reports\report_smoke.html --self-contained-html
) else if "%1"=="auth" (
    REM Run auth tests only
    pytest tests\ -m auth --html=tests\reports\report_auth.html --self-contained-html
) else if "%1"=="property" (
    REM Run property tests only
    pytest tests\ -m property --html=tests\reports\report_property.html --self-contained-html
) else (
    REM Run specific test file
    pytest %1 --html=tests\reports\report.html --self-contained-html
)

echo.
echo ========================================
echo  Test execution completed!
echo  Report: tests\reports\report.html
echo ========================================
echo.

REM Deactivate virtual environment
deactivate

pause
