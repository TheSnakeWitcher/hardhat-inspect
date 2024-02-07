import "hardhat/types/config";
import "hardhat/types/runtime";

import { Inspect } from "./inspect";

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
        inspect: Inspect;
    }
}
