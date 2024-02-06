import fs from "fs"
import path from "path"
import hre from "hardhat"

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

  async refresh() {

      let contractNames: any = {}
      let events: any = {}
      let errors: any = {}

      const artifactsPath = hre.config.paths.artifacts
      const allArtifacts = await hre.artifacts.getArtifactPaths()
      const artifacts = allArtifacts.filter( artifact => {
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

      return errors
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
    const contractNamesFile = path.join(hre.config.paths.data, "contractNames.json")
    const eventsFile = path.join(hre.config.paths.data, "events.json")
    const errorsFile = path.join(hre.config.paths.data, "errors.json")

    fs.writeFileSync(contractNamesFile, JSON.stringify(contractNames))
    fs.writeFileSync(eventsFile, JSON.stringify(events))
    fs.writeFileSync(errorsFile, JSON.stringify(errors))
  }


}