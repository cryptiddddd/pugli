import { statSync, write, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";


let UNNAMED_CTR = 0;


// /////////////// HELPERS
type PullMatchFunc = (path: string) => string | undefined;

function pullMatch(pattern: RegExp, idx: number, backup?: string):  PullMatchFunc {
    return (path: string) => {
        const match = path.match(pattern);
        if (!match) return backup;
        return match[idx];
    };
}


/**
 * generates a name for a file without a parsible name.
 * @returns "unnamed-" + current counter (starting at 0)
 */
export function getUnnamed(): string {
    UNNAMED_CTR ++;
    return `unnamed-${UNNAMED_CTR - 1}`;
}

/**
 * extracts an alphanumeric name for the given file. includes characters a-z, 0-9, -_ (hyphen and underscore), and spaces. case insensitive.
 * @param path filepath to reference.
 * @returns the name of the file, free of absolute path + extension.
 */
export const pullFileName = pullMatch(/\/([A-Za-z0-9-_ ]+)\.[a-z]+$/, 1, undefined);

/**
 * extracts the final file extention of the given path.
 * @param path filepath to reference.
 * @returns the extension of the file, free of all else + prefix period.
 */
export const pullFileExt = pullMatch(/\/.*\.([a-z]+)$/, 1, "");


/**
 * determines if the given item(s) are all objects.
 * @param item any variable
 * @returns true if all given items are objects (not primative, not array)
 */
export function isObject(...items: any): boolean {
    for (let i of items) {
        if (i !== null && typeof i === "object" && !Array.isArray(i)) continue;
        return false;
    }
    return true;
}


// shortcut for checking if the given is a file.
/**
 * function that checks solely if a path is an existing file: returns false if dir OR dne.
 * @param path path to check for being a file
 * @returns true if file, false if dir or dne
 */
export function isFile(path: string): boolean {
    try {
        return statSync(path).isFile();
    } catch (err) {
        return false;
    }
}


/**
 * asynchronous iteratable, runs through the given directory recursively and yields only file names.
 * @param dir directory to walk through
 */
export function* walkDir(dir: string, cfg: WalkCfg = {}): Iterable<string> {
    // iterate through all children.
    for (const sub of readdirSync(dir, { withFileTypes: true })) {
        const res = resolve(dir, sub.name);

        // exclusion
        if (cfg.exclude?.includes(sub.name)) {
            continue;
        } else if (sub.isDirectory()) {
            if (cfg.depth && cfg.depth <= 1) continue;
            yield* walkDir(res, {
                ...cfg, 
                depth: Number.isInteger(cfg.depth)? cfg.depth as number - 1 : undefined
            });
        } else if (!cfg.mustMatch || cfg.mustMatch.test(sub.name)) {
            // should be good to go, yield file.
            yield res;
        }
    }
}

export async function writeFiles(...files: WriteFileOpts[]): Promise<void> {
    let promises = [];
    for (let file of files) {
        let path = join(
            process.cwd(),
            file.name + file.extension? "." + file.extension : ""
        );
        
        promises.push(
            writeFile(path, file.content, {flag: "w+"})
        );
    }
    await Promise.all(promises)
}

/**
 * checks if all given paths are siblings.
 * note: does not confirm existence.
 * @param paths file paths to compare
 * @returns true if all given files paths are siblings
 */
export function filesAreSiblings(...paths: string[]): boolean {
    const dirs = Array.from(paths, (p) => join(p, ".."));
    return dirs.every((p) => p == dirs[0]);
}


// ; (async () => {
//     // for await (const f of walkDir(join(__dirname, ".."), {exclude: ["node_modules"]})) {
//     //     console.log(f);
//     // }

//     // console.log(join(process.argv[1] as string, "../.."));
// })();
