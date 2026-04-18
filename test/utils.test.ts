import { expect, describe, test } from "vitest";

import * as utils from "../src/utils.ts";
import { join } from "node:path";


describe("isObject() checks", () => {

    test("single primative", () => {

        for (let primative of [0, 5, "a", "string", true, false, null, undefined])
            expect(utils.isObject(primative), `${typeof primative} value returned true`).toBe(false);

    });

    test("single object", () => {
        expect(
            utils.isObject({ a: 1 }),
            "object with a single key tested false"
        ).toBe(true);

        expect(
            utils.isObject({ a: 1, b: [2], c: 4 }),
            "object with multiple keys tested false"
        ).toBe(true);

        expect(
            utils.isObject({ 3: "a", 5: "b" }),
            "object with number keys tested false"
        ).toBe(true);

        expect(
            utils.isObject({ true: "a", false: "b" }),
            "object with boolean keys tested false"
        ).toBe(true);
    });

    test("iterables", () => {
        expect(
            utils.isObject([]),
            "empty array returned true"
        ).toBe(false);

        expect(
            utils.isObject([1, 2, 3]),
            "array of numbers returned true"
        ).toBe(false);
    });

    test("class instances", () => {
        expect(
            utils.isObject(new ArrayBuffer(16)),
            "ArrayBuffer instance returned false"
        ).toBe(true);

        expect(
            utils.isObject(new Blob()),
            "Blob instance returned false"
        ).toBe(true);

        expect(
            utils.isObject(console),
            "console object returned false"
        ).toBe(true);
    });

    test("functions", () => {
        expect(
            utils.isObject(() => { }),
            "arrow function returned true"
        ).toBe(false);

        expect(
            utils.isObject(join),
            "join() function returned true"
        ).toBe(false);

        expect(
            utils.isObject(console.log),
            "console.log() function returned true"
        ).toBe(false);

        expect(
            utils.isObject(Math.tan),
            "Math.tan() function returned true"
        ).toBe(false);
    });
});


describe("isFile() checks", () => {
    test("existing file", () => {
        expect(
            utils.isFile(__filename),
            "current file marked as not a file/nonexistent"
        ).toBe(true);
    });

    test("existing directory", () => {
        expect(
            utils.isFile(__dirname),
            "current directory marked as a file"
        ).toBe(false);
    })

    test("nonexisting file", () => {
        expect(
            utils.isFile(join(__dirname, "DNE.txt")),
            "nonexistent file returned true"
        ).toBe(false);
    });
});


// WARN: these all rely on a specific known file structure, changing that structure should not make these tests fail, but then again it's understandable if so.
describe("async walkDir() checks", () => {
    const testDir = join(__dirname, "../demo");

    test("full-depth check", async () => {

        for await (let path of utils.walkDir(testDir))
            expect(utils.isFile(path)).toBe(true);
    });

    test("restricted levels", async () => {
        const result = await Array.fromAsync(
            utils.walkDir(testDir, { depth: 1 })
        );

        expect(result, "result should include one path").toHaveLength(1);

        expect(result, "result should be a config file").toContain(join(testDir, "pug.config.yaml"));
    });

    test("pattern matching", async () => {
        const result = await Array.fromAsync(
            utils.walkDir(testDir, { mustMatch: /data/ })
        );

        for (let file of ['itemA.data.yaml', 'itemB.data.yaml']) {
            expect(
                result,
                `results should contain ${file}`
            ).toContain(join(testDir, "pages/section", file));
        };
    });

    test("exclusions", async () => {
        const result = await Array.fromAsync(
            utils.walkDir(testDir, { exclude: [/page/] })
        );

        expect(
            result,
            "should ignore all paths with 'page' in it"
        ).not.toContain(join(testDir, "pages"));
    });

});

// describe("async writeFiles() checks", () => {

// });

