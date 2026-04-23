
import { readFile } from "node:fs/promises";
import { getUnnamed, pullFileExt, pullFileName } from "./utils.ts";


// file usage
export enum FU {
    Template = "template",
    Data = "data",
}

// file wrapper 
interface FWCfg {
    isPrimary?: boolean;
}

/**
 * a class to wrap files and organize literal + metadata on the given file.
 */
export class FileWrapper {
    fullpath: string;
    name: string;
    ext: string;
    
    usage: FU;
    isPrimaryDep: boolean;

    private cache: string | null;
    private _hasChanged: boolean;

    /**
     * base data points for the given file.
     * @param path the file's full path
     * @param usage the file's type/usage flag
     * @param isPrimary if the file is a dependency.
     */
    constructor(path: string, usage: FU, { isPrimary }: FWCfg = {}) {
        this.fullpath = path;
        this.name = pullFileName(path) || getUnnamed();
        this.ext = pullFileExt(path) || "";

        this.usage = usage;
        this.isPrimaryDep = isPrimary || false;

        this.cache = null;
        this._hasChanged = false;
    }

    /**
     * mark that the file has been changed since the last rendering.
     */
    setChanged(): void {
        this._hasChanged = true;
    }


    /** getter for checking if the file has changed. */
    get hasChanged(): boolean {
        return this._hasChanged;
    }

    /**
     * read the file's contents to a string.
     * @returns promise of file contents.
     */
    async read(): Promise<string> {
        this._hasChanged = false;

        const data = await readFile(this.fullpath);
        this.cache = data.toLocaleString();
        return this.cache;
    }
}
