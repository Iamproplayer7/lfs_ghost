# 👻 LFS Ghost

Supports latest LFS 0.8B9 version.

Real-time ghost car for Live for Speed (LFS).
Race against your best lap from the current session and improve your driving consistency.

## 🚗 How It Works

* When you start a qualifying lap, the script begins recording your vehicle.
* Only the best lap in the current session is shown as ghost.
* After completing a valid qualified lap, a ghost car appears.
* The ghost drives next to you, replaying your best driven lap.

<img width="1089" height="645" alt="ghostcar" src="https://github.com/user-attachments/assets/d62b96e1-05de-4f7c-9eb9-ab35a5154d90" />


## ⚙️ Installation

1. Install dependencies from the project root: `npm install`

## 🛠 Configuration

Configure InSim settings in the following file:
`project/src/vism/plugins/core/index.ts`


## ▶️ Running the Script

1. Start Live for Speed
2. Go to Single Player
3. Join a track
4. In LFS chat, type: `/insim 29999`
5. Run the script: `npm run dev`

## ✅ Expected Result

If everything works correctly:

* Console shows “InSim connected”
* FPS counter appears in the top-left corner of LFS

Important:

* LFS must be in windowed mode

## 🐞 Known Issues

* Does not work in fullscreen mode
* No InSim error handling
* Does not automatically reconnect if InSim fails
* InSim must be reconnected after joining a server
* Not heavily tested

If something does not work, try this order:

1. Configure InSim
2. Join track
3. Run script
4. Drive at least 2 laps to get lap times

## 🚀 Planned Improvements

* Save best laps between sessions
* Show lap time timestamps
* Store best laps for different vehicles

## 💬 Issues & Feedback

Please report any issues or bugs.
Suggestions and pull requests are welcome.