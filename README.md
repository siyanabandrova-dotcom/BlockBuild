BlockBuild – Installation & Run Guide
BlockBuild is a visual, block-based editor for designing neural network architectures.
The project consists of two main components:- Frontend – React application (visual neural network editor)- Backend – FastAPI + PyTorch (model execution and training)
**REQUIRED SOFTWARE**
1. Git (recommended)
https://git-scm.com/downloads
Check:
git --version

3. Python 3.10 or 3.11
Install from:
https://www.python.org/downloads/
Enable "Add Python to PATH"
Check:
python --version

5. Node.js (v18 or v20 recommended)
https://nodejs.org/
Check:
node --version
npm --version

**PROJECT SETUP**
Clone repository:
git clone https://github.com/siyanabandrova-dotcom/BlockBuild.git
cd BlockBuild

**BACKEND SETUP**
Create virtual environment:
python -m venv venv
Activate:
Windows: venv\Scripts\Activate
Linux/macOS: source venv/bin/activate
Install dependencies:
pip install -r requirements.txt
Run backend:
python -m uvicorn server:app --reload --port 8000
Backend URL:
http://localhost:8000
Docs:
http://localhost:8000/docs

**FRONTEND SETUP**
Install dependencies:
npm install
Run frontend:
npm start
Frontend URL:
http://localhost:3000
IMPORTANT:
Backend must be started before frontend
