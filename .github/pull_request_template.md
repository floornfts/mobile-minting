## Mint Ingestor: <Platform Name>

### Functionality Supported
* Ingesting from URL: Yes / No
* Ingesting from Contract address: Yes / No
* Supported Networks: Base / Ethereum / Arbitrum / Zora / Polygon / Others..

### Before you submit
- [ ] Ensure your generated MintTemplate works 😄
- [ ] Ensure that your code is restricted to a single folder in `src/ingestors`
- [ ] Ensure that all required assets are included (e.g. ABIs)
- [ ] Ensure ABIs are trimmed to include only methods (1) used in the ingestor or (2) required to mint
- [ ] Ensure that all exported methods are prefixed with the name of your ingestor e.g. `myMintingPlatformGetContractDetails`
- [ ] Ensure that a test exists for generating a MintTemplate that will always succeed
- [ ] Ensure that your code accesses **no external resources** except those passed in the `resources` object
