import "hardhat/types/config";
import "hardhat/types/runtime";

import { Inspector } from "./inspector";

declare module "hardhat/types/config" {
    export interface ProjectPathsUserConfig {
        data?: string;
    }

    export interface ProjectPathsConfig {
        data: string;
    }
}

declare module "hardhat/types/runtime" {
    export interface HardhatRuntimeEnvironment {
        inspect: Inspector;
    }
}
