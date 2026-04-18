import { statSync, write } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";


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
export async function* walkDir(dir: string, cfg: WalkCfg = {}): AsyncIterable<string> {
    // iterate through all children.
    for (const sub of await readdir(dir, { withFileTypes: true })) {
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
