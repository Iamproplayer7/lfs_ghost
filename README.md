# 👻 LFS Ghost

Supports latest LFS 0.8B9 version.

Real-time ghost car for Live for Speed (LFS).
Race against your best qualified lap and improve your driving consistency and lap time.

## 🚗 How It Works

* When you start a qualifying lap, the script begins recording your vehicle.
* Only the best lap in the current session is shown as ghost.
* After completing a valid qualified lap, a ghost car appears.
* The ghost drives next to you, replaying your best driven lap.

<img width="1089" height="645" alt="ghostcar" src="https://github.com/user-attachments/assets/d62b96e1-05de-4f7c-9eb9-ab35a5154d90" />


## ⚙️ Installation

1. Install dependencies from the project root: `npm install`

## 🛠 Configuration

Configure InSim config in the following folder, default config location for `npm run dev` is:
`%appdata%\Electron\data`

## ▶️ Running the Script

1. Start Live for Speed
2. In LFS chat, type: `/insim 29999`
3. Run the script: `npm run dev`

## ✅ Expected Result

If everything works correctly:

* Console shows “InSim connected” and some LFS buttons may appear on the screen.
* FPS counter appears in the top-left corner of LFS.

Important:

* LFS must be in windowed or borderless windowed mode

## 🐞 Known Issues

* Does not work in fully fullscreen mode
* Some screen artifacts may appear like as: flickering ghost.

If something does not work, try this order:

1. Configure Config.
2. Join track
3. Run script (make sure script does not show any error)
4. Drive at least 2 laps to get lap times

## 💬 Issues & Feedback

Please report any issues or bugs.
Suggestions and pull requests are welcome.