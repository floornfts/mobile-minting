import { simulateEVMTransactionWithAlchemy } from '../lib/simulation/simulation';
import { ALL_MINT_INGESTORS } from '../ingestors';
import { mintIngestorResources } from '../lib/resources';
import dotenv from 'dotenv';
import { EVMMintInstructions } from 'src/lib';
dotenv.config();

const args = process.argv.slice(2);
const [ingestorName, inputType, input] = args;

if (!ingestorName || !inputType || !input) {
  console.error('Missing arguments');
  process.exit(1);
}

console.log(`Running dry-run
  ingestory: ${ingestorName}
  inputType: ${inputType}
  input: ${input}`);

const ingestor = ALL_MINT_INGESTORS[ingestorName];

if (!ingestor) {
  console.error('Ingestor not registered in ALL_MINT_INGESTORS');
  process.exit(1);
}

const resources = mintIngestorResources();

(async () => {
  try {
    let result;
    switch (inputType) {
      case 'url':
        result = await ingestor.createMintTemplateForUrl(resources, input);
        break;
      case 'contract':
        const [chainId, contractAddress, tokenId] = input.split(':');
        if (!chainId || !contractAddress) {
          console.error('Invalid contract input');
          process.exit(1);
        }
        result = await ingestor.createMintForContract(resources, {
          chainId: parseInt(chainId),
          contractAddress,
          tokenId,
        });
        break;
      default:
        console.error('Invalid input type');
        process.exit(1);
    }
    console.log(JSON.stringify(result, null, 2));

    console.log('Simulating transaction....');
    const mintInstructions = result.mintInstructions as EVMMintInstructions;
    const simulationResult = await simulateEVMTransactionWithAlchemy(mintInstructions);
    if (simulationResult.success) {
      console.log('✅ Simulation Success');
    } else {
      console.log('❌ Simulation Failed');
      console.log(JSON.stringify(simulationResult, null, 2));
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
