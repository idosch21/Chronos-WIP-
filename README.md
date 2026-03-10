# 🕒 Chronos: Smart Productivity Tracker (WIP)

A full-stack web activity tracker that uses a Chrome Extension to log browsing telemetry and a FastAPI backend to visualize productivity in real-time.

## 🚀 The Mission
Most time trackers are "naive"—they count time as long as a tab is open. **Chronos** is built to be more accurate by utilizing the Chrome Idle API to pause tracking when the user is away from the keyboard, ensuring your "Deep Work" stats are actually real.

## 🛠️ Tech Stack
* **Extension:** JavaScript (Chrome APIs: Tabs, Idle, Storage)
* **Backend:** Python 3.10+ (FastAPI, Pydantic)
* **Database:** SQLite + SQLAlchemy ORM
* **Dashboard:** HTML5/CSS3 + Chart.js (Data Visualization)

## ✨ Key Features
* **Intelligent Idle Detection:** Automatically stops the clock after 15 seconds of inactivity.
* **Domain Aggregation:** Automatically groups long URLs (e.g., `github.com/user/repo`) into top-level domains for cleaner analytics.
* **Real-time Dashboard:** A visual Doughnut chart showing your daily time distribution.
* **RESTful API:** Clean separation of concerns between the data logger and the analytical summary.

## ⚙️ Setup & Installation

### 1. Backend (FastAPI)
```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/productivity-tracker.git](https://github.com/YOUR_USERNAME/productivity-tracker.git)
cd productivity-tracker
```

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy
2. Chrome Extension
Open chrome://extensions/ in your browser.

Enable Developer Mode.

Click Load Unpacked and select the extension folder in this project.

3. Dashboard
Simply open index.html in your browser to view your live stats!

🚧 Roadmap (Work in Progress)
[ ] Daily Comparisons: Implement a "Yesterday vs Today" productivity score.

[ ] Category Tagging: Auto-tag sites as "Productive" (GitHub, StackOverflow) or "Distraction" (Facebook, YouTube).

[ ] CSV Export: Allow users to download their weekly data for Excel analysis.

[ ] Dark Mode: Because every dev loves dark mode.
