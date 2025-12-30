@echo off
echo ========================================
echo TRAGY Shopify Theme Deployment
echo ========================================
echo.

REM Check if Shopify CLI is installed
shopify version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Shopify CLI not found. Installing...
    npm install -g @shopify/cli @shopify/theme
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Shopify CLI
        pause
        exit /b 1
    )
    echo ✅ Shopify CLI installed successfully
)

echo ✅ Shopify CLI found
echo.

REM Navigate to theme directory
cd /d "%~dp0shopify-theme"
if %errorlevel% neq 0 (
    echo ❌ Could not find shopify-theme directory
    pause
    exit /b 1
)

echo 📁 Current directory: %cd%
echo.

REM Check if user is authenticated
echo 🔐 Checking authentication...
shopify auth whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Please authenticate with Shopify...
    shopify auth login
    if %errorlevel% neq 0 (
        echo ❌ Authentication failed
        pause
        exit /b 1
    )
)

echo ✅ Authentication successful
echo.

REM Show menu
:menu
echo ========================================
echo Choose deployment option:
echo ========================================
echo 1. Preview theme (development server)
echo 2. Push theme to Shopify (unpublished)
echo 3. Push and publish theme (live)
echo 4. Pull theme from Shopify
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto preview
if "%choice%"=="2" goto push
if "%choice%"=="3" goto publish
if "%choice%"=="4" goto pull
if "%choice%"=="5" goto exit
echo Invalid choice. Please try again.
goto menu

:preview
echo.
echo 🚀 Starting development server...
echo 📱 Your theme will be available at the preview URL
echo 🔄 Changes will sync automatically
echo.
shopify theme dev
goto menu

:push
echo.
echo 📤 Pushing theme to Shopify (unpublished)...
shopify theme push --unpublished
if %errorlevel% equ 0 (
    echo ✅ Theme pushed successfully!
    echo 📝 You can preview and publish it from your Shopify admin
) else (
    echo ❌ Failed to push theme
)
echo.
pause
goto menu

:publish
echo.
echo ⚠️  WARNING: This will make your theme live!
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto menu

echo 📤 Pushing and publishing theme...
shopify theme push --live
if %errorlevel% equ 0 (
    echo ✅ Theme is now live!
    echo 🌐 Visit your store to see the changes
) else (
    echo ❌ Failed to publish theme
)
echo.
pause
goto menu

:pull
echo.
echo 📥 Pulling theme from Shopify...
shopify theme pull
if %errorlevel% equ 0 (
    echo ✅ Theme pulled successfully!
) else (
    echo ❌ Failed to pull theme
)
echo.
pause
goto menu

:exit
echo.
echo 👋 Goodbye!
echo.
pause
exit /b 0