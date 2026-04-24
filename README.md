# ⏱️ Chronos

**Chronos** is a privacy-first, self-hosted productivity tracker. It combines a Chrome extension that monitors your active browsing time with a FastAPI backend that securely logs your data to your own personal database.

Unlike commercial trackers, Chronos is entirely self-hosted. **You own 100% of your data.** No third-party servers, no selling of your browsing history—just your data on your terms.

---

## ✨ Features
* **Accurate Tracking:** Automatically logs the domain you are actively viewing.
* **Smart Idle Detection:** Pauses tracking when you switch away from Chrome or stop interacting, with intelligent overrides for active meetings (Google Meet, Zoom) or media playback.
* **Visual Dashboard:** View your daily and all-time productivity using interactive Chart.js visualizations.
* **Zero-Config Deployment:** Ready for one-click deployment to Render with automated PostgreSQL provisioning.

---

## 🚀 Quick Start: Run Your Own Instance

Setting up your own private version of Chronos takes less than 5 minutes.

### 1. Deploy Your Backend
Deploy your private Web Server and PostgreSQL database on Render. 

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

*Wait for Render to finish the build. Once live, copy your service URL (e.g., `https://chronos-api-abcd.onrender.com`).*

### 2. Install the Chrome Extension
1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right corner).
4. Click **Load unpacked** and select the `extension` folder from this project.

### 3. Connect the Dots
1. Right-click the **Chronos** icon in your Chrome toolbar and select **Options**.
2. Paste your Render service URL into the API URL field.
3. Click **Save**.
4. Browse the web for a moment, then click the extension icon to see your data live!

---

## 🛠️ Local Development

If you want to modify the code or test locally, the backend is configured to use a local SQLite database by default if no cloud environment variables are found.

### Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000
