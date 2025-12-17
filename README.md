BlockBuild – Installation & Run Guide
BlockBuild is a visual, block-based editor for designing neural network architectures.
The project consists of two main components:- Frontend – React application (visual neural network editor)- Backend – FastAPI + PyTorch (model execution and training)
**REQUIRED SOFTWARE**
1. Git (recommended)
https://git-scm.com/downloads
Install the first option: **Git for Windows (x64 Setup)**.
For choosing the default editor used by Git: Use Visual Studio Code or Notepad as Git’s default editor.
For Adjusting the name of the initial branch in new repositories: Select Override the default branch name fir new repositories.
Another setting are as default.
Check:
git --version

3. Python 3.10 or 3.11
Install from:
https://www.python.org/downloads/
Enable "Add Python to PATH"
Update setting now? - Yes
Add comands directory to your PATH now? - Yes
Install CPython now? - Yes
Check:
python --version

5. Node.js (v18 or v20 recommended)
https://nodejs.org/
Install: Windows Installer (.msi)
In Tools for Native Modules: Do not mark Automatically install the necessary tools
Check:
node --version
npm --version
For check enter PowerShell as Administrator
Write this command: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

**PROJECT SETUP**
Clone repository:

git clone https://github.com/siyanabandrova-dotcom/BlockBuild.git


cd BlockBuild

Check:
git status

**BACKEND SETUP**
Create virtual environment:
In BlockBuild folder: 
python -m venv venv
Activate:
Windows: venv\Scripts\Activate
Have to see: (venv) PS: ...
Linux/macOS: source venv/bin/activate
Install dependencies:
pip install -r requirements.txt
Run backend:
python -m uvicorn server:app --reload --port 8000
Backend URL:
http://localhost:8000
Docs:
http://localhost:8000/docs

In other terminal
**FRONTEND SETUP**
Install dependencies:
cd BlockBuild
npm install
Run frontend:
npm start
Frontend URL:
http://localhost:3000
IMPORTANT:
Backend must be started before frontend
