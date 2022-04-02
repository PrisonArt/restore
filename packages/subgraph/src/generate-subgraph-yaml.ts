import networkMapping from '../config/deployments.json';
import fs from 'fs';
import Mustache from 'mustache';

fs.readFile('./subgraph.yaml.mustache', async function(err, data) {

    console.log(data);

    const chainIds = Object.keys(networkMapping);

    for (const chainId of chainIds) {
        const networkMappingForChain = networkMapping[chainId as keyof typeof networkMapping];
        const networkName = networkMappingForChain[0]['name'];
        const justiceMapping = networkMappingForChain[0]['contracts']['Justice'];
        const restoreMapping = networkMappingForChain[0]['contracts']['Restore'];

        const out = Mustache.render(data.toString(), {
            network: networkName,
            justiceAddress: justiceMapping.address,
            restoreAddress: restoreMapping.address,
        });

        fs.writeFileSync(
            `./subgraph.${networkName}.yaml`,
            out
        )  
    }

});