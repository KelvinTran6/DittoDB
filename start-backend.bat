@echo off
echo Starting DittoBase Backend...

cd backend

REM Check if venv exists, if not create it
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install requirements if needed
if not exist venv\Lib\site-packages\fastapi (
    echo Installing requirements...
    pip install -r requirements.txt
)

REM Start the server
echo Starting server...
uvicorn app.main:app --reload

REM Keep the window open if there's an error
pause 