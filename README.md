# 🕒 Chronos: Smart Productivity Tracker 

A full-stack web activity tracker that uses a Chrome Extension to log browsing telemetry and a FastAPI backend to visualize productivity in real-time.

## 🚀 The Mission
Most time trackers are "naive"—they count time as long as a tab is open. **Chronos** is built for accuracy by utilizing the **Chrome Idle API** and **Media Playback detection** to ensure your "Deep Work" stats reflect reality, not just open tabs.

## 🛠️ Tech Stack
* **Extension:** JavaScript (Chrome APIs: Tabs, Idle, Runtime)
* **Backend:** Python 3.10+ (FastAPI, Pydantic, SQLAlchemy)
* **Database:** SQLite (Relational data for precise timelines)
* **Dashboard:** HTML5/CSS3 + Chart.js (Interactive Data Visualization)

## ✨ Key Features
* **Intelligent Idle Detection & Video Bypass:** Automatically stops the clock after 15 seconds of inactivity. **However**, if the active tab is playing audio or video (e.g., YouTube lectures), Chronos knows to keep the timer running.
* **Historical Data Explorer:** Beyond "Today's Stats," use the built-in calendar picker to jump to any specific date in your history to see where your time went.
* **All-Time Summary:** A dedicated view to see your cumulative usage across all recorded history.
* **Domain Aggregation:** Automatically strips the domain name (e.g., `google.com`) from messy URLs for clean, readable analytics.
* **Session Guard:** Automatically filters out "noise" data, such as local project files (`file:///`), Chrome system pages, and the tracker's own dashboard.
* **Interactive 24-Hour Timeline:** A dynamic histogram that automatically maps UTC data to your local timezone and supports "drill-down" filtering by clicking specific domains in the doughnut chart.
## ⚙️ Setup & Installation

### 1. Backend (FastAPI)
```bash
# Clone the repository
git clone [https://github.com/idosch21/productivity-tracker.git](https://github.com/idosch21/productivity-tracker.git)
cd productivity-tracker
```
# Create and activate virtual environment
```bash
python -m venv venv
.\venv\Scripts\activate  # On Windows
```

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic
2. Run the Server
```Bash
uvicorn main:app --reload
```

3. Chrome Extension
Open chrome://extensions/ in your browser.

Enable Developer Mode (top right).

Click Load Unpacked and select the folder containing the extension files.

4. Dashboard
Simply open index.html in your browser to view your live stats!

## 🚧 Roadmap
[x] Date Filtering: Explore history day-by-day.

[x] Audible Detection: Stay active while watching educational content.

[x] Smart Filtering: Ignore local files and dashboard activity.

[ ] Category Tagging: Auto-tag sites as "Productive" (GitHub, StackOverflow) or "Distraction".

[ ] Daily Goals: Set a target for "Study Time" and track your progress bar.

[ ] Dark Mode: The developer's choice.

Created by Ido
