import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { Inspector } from "./inspector";
import "./type-extensions";

extendConfig( (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const userPath = userConfig.paths?.data;

    let dataPath: string;
    if (userPath === undefined) {
        dataPath = path.join(config.paths.root, "data");
    } else {
        if (path.isAbsolute(userPath)) {
            dataPath = userPath;
        } else {
            dataPath = path.normalize(path.join(config.paths.root, userPath));
        }
    }

    config.paths.data = dataPath;
});

extendEnvironment( (env: any) => {
    env.inspect = lazyObject( () => new Inspector(env));
});

task("compile", async function(args: any, env: any, runSuper: any) {
    await runSuper(args);
    await inspect(env)
})

task("inspect", async function(args: any, env: any, runSuper: any) {
    await inspect(env)
})

async function inspect(env: any) {
    const inspect = new Inspector(env)
    await inspect.refresh()
    await inspect.save()
}
