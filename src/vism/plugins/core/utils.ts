export const Utils = {
    toLFSTime: (ms: number) => {
        ms = Math.abs(ms);

        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        let milliseconds = ms % 1000;
        let secondsText = (seconds % 60) < 10 ? '0' + (seconds % 60).toString() : (seconds % 60);
        let minutesText = (minutes % 60) < 10 ? '0' + (minutes % 60).toString() : (minutes % 60);
        let millisecondsText = milliseconds < 10 ? '0' + milliseconds.toString() : milliseconds;

        return (ms > 0 ? minutesText + ':' + secondsText + '.' + millisecondsText : '00:00.000');
    }
}