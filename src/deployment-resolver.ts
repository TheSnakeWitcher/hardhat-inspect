import fs from "fs"
import path from "path"
import { HardhatRuntimeEnvironment } from "hardhat/types"

export type Deployments = {
    [id: string]:  {
        [chainId: number]: string
    }
}

export interface DeploymentFetcher {
    fetchDeployments : (env: HardhatRuntimeEnvironment) => Deployments ;
    checkDeployments : (env: HardhatRuntimeEnvironment) => boolean ;
}

export class HardhatDeployDeploymentFetcher {

    fetchDeployments(env: HardhatRuntimeEnvironment) {
        const deploymentsDir = this.getDeploymentsDir(env)
        const networkDeployments = fs.readdirSync(deploymentsDir)

        let deployments : Deployments = {}
        for(let networkDeployment of networkDeployments) {

            const f = path.join(deploymentsDir, networkDeployment)
            const chainId = this.getChainId(f)
            const chainDeployments = this.getDeployments(f)

            for (let deploymentId in chainDeployments) {
                if (!deployments[deploymentId]) {
                    deployments[deploymentId] = {
                        [chainId] : chainDeployments[deploymentId]
                    }
                } else {
                    deployments[deploymentId][chainId] = chainDeployments[deploymentId]
                }
            }
        }

        return deployments
    }

    checkDeployments(env: HardhatRuntimeEnvironment) {
        return this.getDeploymentsDir(env) !== undefined
    }

    getDeploymentsDir(env: HardhatRuntimeEnvironment) {
        return path.join(env.config.paths.root, "deployments")
    }

    private getChainId(networkDeploymentDir: string) {
        const file = path.join(networkDeploymentDir, ".chainId")
        return Number(fs.readFileSync(file))
    }

    private getDeployments(networkDeploymentDir: string) {
        let chainDeployments : any = {}

        fs.readdirSync(networkDeploymentDir)
            .filter( filename => filename.match(/\.json$/))
            .forEach( (filename) => {
                const file = path.join(networkDeploymentDir, filename)
                const address = (JSON.parse(fs.readFileSync(file).toString())).address
                chainDeployments[filename] = address
            })

        return chainDeployments
    }

}

export class HardhatIgnitionDeploymentFetcher {

    fetchDeployments(env: HardhatRuntimeEnvironment) {
        const deploymentsDir = this.getDeploymentsDir(env)
        const networkDeployments = fs.readdirSync(deploymentsDir)

        let deployments : Deployments = {}
        for(let networkDeployment of networkDeployments) {

            const f = path.join(deploymentsDir, networkDeployment)
            const chainId = this.getChainId(f)
            const chainDeployments = this.getDeployments(f)

            for (let deploymentId in chainDeployments) {
                if (!deployments[deploymentId]) {
                    deployments[deploymentId] = {
                        [chainId] : chainDeployments[deploymentId]
                    }
                } else {
                    deployments[deploymentId][chainId] = chainDeployments[deploymentId]
                }
            }
        }

        return deployments
    }

    checkDeployment(env: HardhatRuntimeEnvironment) {
        return this.getDeploymentsDir(env) !== undefined
    }

    getDeploymentsDir(env: HardhatRuntimeEnvironment) {
        return path.join(env.config.paths.root, "ignition/deployments")
    }

    private getChainId(networkDeploymentDir: string) {
        return Number(
            path.basename(networkDeploymentDir).split('-')[1]
        )
    }

    private getDeployments(networkDeploymentDir: string) {
        const file = path.join(networkDeploymentDir, "deployed_addresses.json")
        const chainDeployments = JSON.parse(fs.readFileSync(file).toString())
        return chainDeployments
    }

}
