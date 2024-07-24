import { expect } from "chai";
import { MintContractOptions, MintIngestor, MintIngestorResources } from "../../src/lib/types/mint-ingestor";
import { MintTemplateBuilder } from "../../src/lib/builder/mint-template-builder";
import { simulateEVMTransactionWithAlchemy } from "../../src/lib/simulation/simulation";
import { EVMMintInstructions } from "../../src/lib/types";

export const basicIngestorTests = (
    ingestor: MintIngestor, 
    resources: MintIngestorResources,
    cases: {
        successUrls: string[],
        failureUrls: string[],
        successContracts: MintContractOptions[],
        failureContracts: MintContractOptions[],
    },
    simulationBlocks: { [key: number]: string } = {}
) => {
    const shouldSimulate = process.env.SIMULATE_DURING_TESTS === "true";

    describe(`${ingestor.constructor.name}-auto`, function () {
        const { successUrls, failureUrls, successContracts, failureContracts } = cases;

        it('supportsUrl: Returns true for a supported URL', async function () {
            for (const url of successUrls) {
                const result = await ingestor.supportsUrl(resources, url)
                expect(result).to.be.true;
            }
        });
        for (const url of failureUrls) {
            it(`supportsUrl: Returns false for unsupported url (${url})`, async function () {
                    const result = await ingestor.supportsUrl(resources, url)
                    expect(result).to.be.false;
            });
        }
        it('supportsContract: Returns true for a supported contract', async function () {
            for (const contract of successContracts) {
                const result = await ingestor.supportsContract(resources, contract)
                expect(result).to.be.true;
            }
        });
        it('supportsContract: Returns false for an unsupported contract', async function () {
            for (const contract of failureContracts) {
                const result = await ingestor.supportsContract(resources, contract)
                expect(result).to.be.false;
            }
        });
        it('createMintTemplateForUrl: Returns a mint template for a supported URL', async function () {
            for (const url of successUrls) {
                const template = await ingestor.createMintTemplateForUrl(resources, url);

                // Verify that the mint template passed validation
                const builder = new MintTemplateBuilder(template);
                builder.validateMintTemplate();

                if (shouldSimulate) {
                    const mintInstructions = template.mintInstructions as EVMMintInstructions;
                    const result = await simulateEVMTransactionWithAlchemy(mintInstructions, simulationBlocks[mintInstructions.chainId]);
                    expect(result.success).to.be.true;
                    if (result.success) {
                        console.log(`✅ Simulation success`);
                    }
                }
            }
        });
        it('createMintForContract: Returns a mint template for a supported contract', async function () {
            for (const contract of successContracts) {
                const template = await ingestor.createMintForContract(resources, contract);

                // Verify that the mint template passed validation
                const builder = new MintTemplateBuilder(template);
                builder.validateMintTemplate();
            }
        });
    });
}
