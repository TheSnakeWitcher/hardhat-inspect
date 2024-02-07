import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { Inspect } from "./inspect";
import "./type-extensions";

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
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
}
);

extendEnvironment((hre: any) => {
    hre.inspect = lazyObject(() => new Inspect());
});
