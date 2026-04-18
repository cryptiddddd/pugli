

type DataDict = Record<string, any>;

interface LogLvl {
    prefix: string;
    chalkClass: keyof ChalkInstance;
}

type Logger<T> = Record<keyof T, Function> & { disabled: boolean, pretty: boolean; };

interface RendererCfg {
    path: string;
    outDir?: string;

    compileConfig?: DataDict;
    globalData?: DataDict;

    // cli opts
    forClient?: boolean;
    clientName?: string;
    outputExt?: string;
    doctype?: string;
}

// util cfg

interface WalkCfg {
    exclude?: (RegExp | string)[];
    depth?: number;

    mustMatch?: RegExp;
}

interface WriteFileOpts {
    content: string;
    name: string;
    extension: string;
}
