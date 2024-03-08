import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"
import path from "path"

interface ContractItem {
    [contractname: string]: Item;
}

interface Item {
    [itemname: string]: string;
}

interface ContractName {
    [contractName: string]: string;
}

export class Inspector {
    public contractNames : ContractName ;
    public events : ContractItem ;
    public errors : ContractItem ;
    public functionSelectors : ContractItem ;
    private env ;

    constructor(env: HardhatRuntimeEnvironment) {
        this.contractNames = {}
        this.events = {}
        this.errors = {}
        this.functionSelectors = {}
        this.env = env ;
    }

    public async refresh() {
        const artifactsPath = this.env.config.paths.artifacts
        const artifacts = (await this.env.artifacts.getArtifactPaths()).filter( (artifact: string) => {
            return path.relative(artifactsPath, artifact).startsWith("contracts")
        })

        for (let artifact of artifacts) {
            const source = path.basename(path.dirname(artifact))
            const sourceName = source.replace(path.extname(source),"")
            let artifactContent

            try {
                artifactContent = await this.env.artifacts.readArtifact(sourceName)
            } catch (err) {
                continue
            }

            const contractName = artifactContent.contractName
            const { events: contractEvents , errors: contractErrors } = this.getData(artifactContent.abi)

            this.contractNames[contractName] = contractName
            this.errors[contractName] = contractErrors
            this.events[contractName] = contractEvents
            this.functionSelectors[contractName] = contractEvents
        }

        return {
            contractNames: this.contractNames,
            errors: this.errors,
            events: this.events
        }
    }

    private getData(abi: any) {
        const errors: any  = {}
        const events: any = {}

        for (let item of abi) {

            if (item.type == "error") {
                errors[item.name] = item.name
            }

            if (item.type == "event") {
                events[item.name] = item.name
            }

        }

        return { errors, events }
    }

    public async save() {
        const dataPath = this.env.config.paths.data
        if ( !fs.existsSync(dataPath) ) {
            fs.mkdirSync(dataPath)
        }

        const contractNamesFile = path.join(dataPath, "contractNames.json")
        const eventsFile = path.join(dataPath, "events.json")
        const errorsFile = path.join(dataPath, "errors.json")

        const SPACE = 4 ;
        fs.writeFileSync(contractNamesFile, JSON.stringify(this.contractNames, null, SPACE))
        fs.writeFileSync(eventsFile, JSON.stringify(this.events, null, SPACE))
        fs.writeFileSync(errorsFile, JSON.stringify(this.errors, null, SPACE))
    }

}
