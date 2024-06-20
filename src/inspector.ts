import { HardhatRuntimeEnvironment } from "hardhat/types"
import fs from "fs"
import path from "path"

interface ContractItem {
    [contractname: string]: Item;
}

interface Item {
    [itemname: string]: string;
}

interface ContractAttribute {
    [contractName: string]: string;
}

export class Inspector {
    public contractNames : ContractAttribute ;
    public abis : any ;
    public events : ContractItem ;
    public errors : ContractItem ;
    private env ;

    constructor(env: HardhatRuntimeEnvironment) {
        this.contractNames = {}
        this.events = {}
        this.errors = {}
        this.abis = {}
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
            this.abis[contractName] = artifactContent.abi
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
        this.createDirIfNotExists(dataPath)

        const contractNamesFile = path.join(dataPath, "contractNames.json")
        const eventsFile = path.join(dataPath, "events.json")
        const errorsFile = path.join(dataPath, "errors.json")
        const abisPath = path.join(dataPath, "abis")

        const SPACE = 2 ;
        fs.writeFileSync(contractNamesFile, JSON.stringify(this.contractNames, null, SPACE))
        fs.writeFileSync(eventsFile, JSON.stringify(this.events, null, SPACE))
        fs.writeFileSync(errorsFile, JSON.stringify(this.errors, null, SPACE))
        this.saveAbis(abisPath);
    }

    private saveAbis(abisPath: string) {
        this.createDirIfNotExists(abisPath)
        for (let contract in this.contractNames) {
            const abi = this.abis[contract]
            const out = path.join(abisPath, `${contract}.json`)
            fs.writeFileSync(out, JSON.stringify(abi, null, 2))
        }
    }

    private createDirIfNotExists(dir: string) {
        if ( !fs.existsSync(dir) ) {
            fs.mkdirSync(dir)
        }
    }

}
