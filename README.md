# 👻 lfs_ghost

Real-time ghost car for Live for Speed (LFS).
Race against your best lap from the current session and improve your driving consistency.

---

## 🚗 How It Works

* When you start a qualifying lap, the script begins recording your vehicle.
* Only the best lap in the current session is recorded.
* After completing a valid lap, a ghost car appears.
* The ghost drives next to you, replaying your best driven lap.

Image preview:
[https://github.com/user-attachments/assets/d4e16386-fe27-4469-ab7e-6acc49d814d8](https://github.com/user-attachments/assets/d4e16386-fe27-4469-ab7e-6acc49d814d8)

---

## ⚙️ Installation

1. Install dependencies from the project root:

npm install

2. Fix memoryjs installation (if needed):

If you see an error saying that memoryjs cannot be installed:

* Extract the memoryjs.zip archive
* Copy it into: project/node_modules

memoryjs is an old and unsupported dependency.
This is a workaround using a pre-built version.

---

## 🛠 Configuration

Configure InSim settings in the following file:

project/src/vism/plugins/core/index.ts

---

## ▶️ Running the Script

1. Start Live for Speed
2. Go to Single Player
3. Join a track
4. In LFS chat, type:

/insim 29999

5. Run the script:

npm run dev

---

## ✅ Expected Result

If everything works correctly:

* Console shows “InSim connected”
* FPS counter appears in the top-left corner of LFS

Important:

* LFS must be in windowed mode
* Fullscreen mode does not work

---

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

---

## 🚀 Planned Improvements

* Save best laps between sessions
* Show lap time timestamps
* Store best laps for different vehicles

---

## 💬 Issues & Feedback

Please report any issues or bugs.
Suggestions and pull requests are welcome.

---

If you want it **more minimal**, **more flashy**, or **more technical**, just tell me 👍
