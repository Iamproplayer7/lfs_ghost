export const Utils = {
    toLFSTime: (ms: number) => {
        ms = Math.abs(ms);

        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        let milliseconds = ms % 1000;
        let secondsText = (seconds % 60) < 10 ? '0' + (seconds % 60).toString() : (seconds % 60);
        let minutesText = (minutes % 60) < 10 ? '0' + (minutes % 60).toString() : (minutes % 60);
        let millisecondsText = milliseconds < 100 ? '00' + milliseconds.toString() : (milliseconds < 10 ? '0' + milliseconds.toString() : milliseconds);

        return (ms > 0 ? minutesText + ':' + secondsText + '.' + millisecondsText : '00:00.000');
    },
    clamp: (v: number, min: number, max: number) => {
        return Math.min(Math.max(v, min), max);
    },
    speedToHexColor: (speed: number, centerSpeed: number) => {
        const range = 5;
    
        let t = (speed - centerSpeed) / range;
        t = Utils.clamp(t, -1, 1);
    
        let r, g;
    
        if (t < 0) {
            r = 255;
            g = Math.round(255 * (1 + t));
        } else {
            r = Math.round(255 * (1 - t));
            g = 255;
        }
    
        return (r << 16) | (g << 8);
    }
    
}