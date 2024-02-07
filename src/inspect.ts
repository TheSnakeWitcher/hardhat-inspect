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

export class Inspect {
    public contractNames : ContractName = {} ;
    public events : ContractItem = {} ;
    public errors : ContractItem = {} ;

    constructor() {
        this.contractNames = {}
        this.events = {}
        this.errors = {}
    }

    async refresh() {

        let contractNames: any = {}
        let events: any = {}
        let errors: any = {}

        const artifactsPath = hre.config.paths.artifacts
        const artifacts = (await hre.artifacts.getArtifactPaths()).filter( (artifact: string) => {
            return path.relative(artifactsPath, artifact).startsWith("contracts")
        })

        for (let artifact of artifacts) {
            const source = path.basename(path.dirname(artifact))
            const sourceName = source.replace(path.extname(source),"")
            let artifactContent

            try {
                artifactContent = await hre.artifacts.readArtifact(sourceName)
            } catch (err) {
                continue
            }

            const contractName = artifactContent.contractName
            const { events: contractEvents , errors: contractErrors } = this.getData(artifactContent.abi)

            contractNames[contractName] = contractName
            errors[contractName] = contractErrors
            events[contractName] = contractEvents
        }

        return { contractNames, errors, events }
    }

    private getData(abi: any) {
        const errors: any  = {}
        const events: any = {}

        for (let item of abi) {

            if (item.type == "error") {
                errors[item.name] = [item.name]
            }

            if (item.type == "event") {
                events[item.name] = [item.name]
            }

        }

        return { errors, events }
    }

    async save(contractNames: ContractName, errors: ContractItem, events: ContractItem) {
        const dataPath = hre.config.paths.data
        if ( !fs.existsSync(dataPath) ) {
            fs.mkdirSync(dataPath)
        }

        const contractNamesFile = path.join(dataPath, "contractNames.json")
        const eventsFile = path.join(dataPath, "events.json")
        const errorsFile = path.join(dataPath, "errors.json")

        fs.writeFileSync(contractNamesFile, JSON.stringify(contractNames))
        fs.writeFileSync(eventsFile, JSON.stringify(events))
        fs.writeFileSync(errorsFile, JSON.stringify(errors))
    }

}
