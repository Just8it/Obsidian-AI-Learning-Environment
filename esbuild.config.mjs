import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";

const prod = process.argv[2] === "production";

const vaultPluginPath = "C:/Users/jugri/Documents/My Vault/.obsidian/plugins/ai-flashcards";

esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins
    ],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
    minify: prod,
}).then(() => {
    // Copy to vault
    if (fs.existsSync(vaultPluginPath)) {
        fs.copyFileSync("main.js", `${vaultPluginPath}/main.js`);
        console.log("Copied main.js to vault.");
        if (fs.existsSync("styles.css")) {
            fs.copyFileSync("styles.css", `${vaultPluginPath}/styles.css`);
            console.log("Copied styles.css to vault.");
        }
    }
}).catch(() => process.exit(1));
