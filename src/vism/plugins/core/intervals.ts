
import { MenuButton, MenuButtonType } from "../../main/classes/Menu.js";
import { Command, Interval, Menu } from "../../main/index.js";

Command.on('intervals', (player) => {
    const Menu_ = new Menu(player, 'INTERVAL MENU', '^7Intervals');
    var list: { button: MenuButton, interval: Interval }[] = [];
    for(const value of Interval.all) {
        list.push({ 
            button: Menu_.addButton(MenuButtonType.BUTTON_CLICK, '^7' + value.name), 
            interval: value 
        });
    }

    Menu_.setInterval(async () => {
        for(const item of list) {
            const last = item.interval.performance.last.toFixed(2);
            const avg = item.interval.performance.avg.time/item.interval.performance.avg.times;
            const min = item.interval.performance.min.toFixed(2);
            const max = item.interval.performance.max.toFixed(2)

            item.button.setDescription('^2last: ' + last + 'ms, avg: ' + (isNaN(avg) ? 0 : avg.toFixed(2)) + 'ms', '^2min: ' + min + 'ms, max: ' + max + 'ms', '^7interval: ' + item.interval.performance.ms + ' ms');
        }
    }, 100);
});