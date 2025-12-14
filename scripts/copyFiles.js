import fs from 'fs';
import * as glob from 'glob';

const files = glob.sync(`./src/**/*.!(ts)`);
for(const file of files) {
    const filePath = file.replaceAll('\\', '/');
    const folder = filePath.split('/').slice(0, filePath.split('/').length-1).join('/');
    fs.mkdirSync(folder.replace('src/', 'dist/src/'), { recursive: true });

    fs.copyFileSync(filePath, filePath.replace('src/', 'dist/src/'));
    console.log(`File: ${filePath} copied.`);
}