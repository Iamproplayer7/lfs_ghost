# lfs_ghost

How does it work?:
After starting qualifying a lap it starts record a ghost for your vehicle, only records best lap in the session. When you finish lap and have recorded ghost it drives by your side to reflect your best driven lap.
<img width="1089" height="645" alt="image" src="https://github.com/user-attachments/assets/d4e16386-fe27-4469-ab7e-6acc49d814d8" />

How to start script:
In main path of project run `npm install`

If you see an error that says `memoryjs` can't be installed, extract `memoryjs.zip` archive into `project/node_modules` directory. 
(memoryjs is an old decendency and not supported anymore, that is workaround with already builded dependency)

After copying `memoryjs` configure InSim settings that are located inside `project/src/vism/plugins/core/index.ts`.

Run LFS, go to single player, join a track and write /insim 29999.
Run script by `npm run dev` command.

If everything works, you will see InSim connected message in console and FPS counter in LFS left-top border.
LFS should be in windowed mode (fullscreen does not work).

# Issues
- Report any issues.
- Does not work on fullscreen mode.
- Does not handle any InSim errors.
- Does not trying to reconnect if can't connect to InSim.
- After login to server InSim needs to be reconnected.
- Was not heavily tested.
- If something does not work. Try this order: (configure insim -> join track -> run script -> get lap times 2x)

# Improvements
- Save best laps for next sessions.
- Show timestamps for lap times.
- Get best laps for different vehicles.