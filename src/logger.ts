import chalk, { ChalkInstance } from "chalk";


// define logging levels and fruit sign indicators <3
const LVLS = {
    "error":    {prefix: "🍓", chalkClass: 'red'},
    "warn":     {prefix: "🍌", chalkClass: "brightYellow"},
    "debug":    {prefix: "🍇", chalkClass: 'magenta'},
    "info":     {prefix: "🫐 ", chalkClass: 'blue'},
    "success":  {prefix: "🥝", chalkClass: 'green'},
};


/**
 * generates a logger with the given parameters.
 * @param levels levels and their display parameters
 * @returns a logger
 */
function makeLogger(levels: DataDict): Logger<typeof levels> {
    let ob: DataDict = { disabled: false, pretty: false };

    for (let [name, params] of Object.entries(levels) as [string, LogLvl][]) {
        // @ts-ignore
        var cslFunc = console[name] ? console[name] : console.log;

        ob[name] = (...args: any[]) => {
            // @ts-ignore
            if (!ob.disabled) cslFunc(params.prefix? params.prefix : `[${name.toUpperCase()}]`, ...Array.from(args, (v) => {
                const f = chalk[params.chalkClass as keyof ChalkInstance] as Function;
                return typeof f === "function" && typeof v !== "object"? f(v) : v 

            }));
        }
    }

    return ob as Logger<typeof levels>;
}


export var logger = makeLogger(LVLS) as Logger<typeof LVLS>;
