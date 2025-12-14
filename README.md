# lfs_ghost

How does it work?:
After starting qualifying a lap it starts record a ghost for your vehicle, only records best lap in the session. When you finish lap and got recorded ghost it drives by your side to reflect your best driven map.
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