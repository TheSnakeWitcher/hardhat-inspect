import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { Inspect } from "./inspect";
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

extendEnvironment( (hre: any) => {
    hre.inspect = lazyObject(() => new Inspect());
});

task("compile", async function(args: any, hre: any, runSuper: any) {
    await runSuper(args);
    const inspect = new Inspect()
    const { contractNames, events, errors } = await inspect.refresh()
    await inspect.save(contractNames, events, errors)
})
