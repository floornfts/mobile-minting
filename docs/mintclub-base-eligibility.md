# Mint Club Base Eligibility Evidence

Captured: 2026-05-12 05:50 America/Chicago

Source:
- Mint Club V2 Base bond contract: `0xc5a076cad94176c2996B32d8466Be1cE757FAa27`
- Base WETH reserve token: `0x4200000000000000000000000000000000000006`
- BaseScan token holder pages linked in the table below for each Mint Club ERC1155 token.

Evidence was captured with a local scanner against the sources above.

The scan found 1,062 WETH-backed Mint Club ERC1155 candidates on Base with more than 10 current supply and remaining mintable supply. Selected BaseScan holder-qualified results are below. Each BaseScan holder count is a unique address count for the linked token. `OBSIDIAN` alone has 917 unique holder addresses, so the union of unique collectors across these selected Mint Club Base mints is at least 917 even if every other token fully overlaps.

Reproduction:
- Confirm symbol-to-token resolution with the deterministic Create2 formula covered in `test/ingestors/mintclub.test.ts`.
- Confirm `currentSupply`, `maxSupply`, and `reserveToken` with `getDetail(token)` on the Mint Club V2 Base bond contract.
- Open each BaseScan holder page linked below and verify the holder count shown for the token.

| Symbol | Name | Token | Supply | Max Supply | Holders | Holder evidence |
| --- | --- | --- | ---: | ---: | ---: | --- |
| PUNKS | PUNK MOSH PIT | `0x9974A5CD8C484D7df85a0C56B807E98755cD732B` | 100,000 | 1,000,000 | 381 | [BaseScan](https://basescan.org/token/0x9974A5CD8C484D7df85a0C56B807E98755cD732B#balances) |
| APD | ApeDegen black pencil Nft | `0x3FBd3D7d9e465811db58f745eA7fA42901Aa31db` | 70,000 | 100,000 | 408 | [BaseScan](https://basescan.org/token/0x3FBd3D7d9e465811db58f745eA7fA42901Aa31db#balances) |
| CULT | CULTURE | `0x0bBAa6f85ad8199302f16507ACc911aCd49E7863` | 10,000 | 100,000 | 420 | [BaseScan](https://basescan.org/token/0x0bBAa6f85ad8199302f16507ACc911aCd49E7863#balances) |
| BLOB | Base Blob | `0x832C76B6Ec18e37A2b5B4718a843D4633efFAaB0` | 10,000 | 100,000 | 171 | [BaseScan](https://basescan.org/token/0x832C76B6Ec18e37A2b5B4718a843D4633efFAaB0#balances) |
| OBSIDIAN | Obsidian Vein Core | `0x3519cDa3A69Aba975065a888CD206040F5288A0b` | 10,000 | 250,000 | 917 | [BaseScan](https://basescan.org/token/0x3519cDa3A69Aba975065a888CD206040F5288A0b#balances) |
| EKT | Everyone  Knows That | `0xf3ce291d8AdE6c2bf3a4431F10D1616f2BD307fa` | 9,995 | 10,000 | 438 | [BaseScan](https://basescan.org/token/0xf3ce291d8AdE6c2bf3a4431F10D1616f2BD307fa#balances) |
| TRUMPEP | TRUMP PEPE | `0x102426Ce29AeF9C2952aa16507A6AcAf51216C69` | 8,888 | 100,000 | 339 | [BaseScan](https://basescan.org/token/0x102426Ce29AeF9C2952aa16507A6AcAf51216C69#balances) |
| EARTH | onchain earth | `0x7f1d47133680c89138e7c04b6411b5f4Bca7eE96` | 8,888 | 10,000 | 301 | [BaseScan](https://basescan.org/token/0x7f1d47133680c89138e7c04b6411b5f4Bca7eE96#balances) |
| EARLY | onchain gaias | `0x9B98A355840f01D4a6a0E97c3dF430e37A2695Dc` | 5,556 | 55,556 | 482 | [BaseScan](https://basescan.org/token/0x9B98A355840f01D4a6a0E97c3dF430e37A2695Dc#balances) |
| PEAKYPEPE | PEAKY PEPE | `0x69832024e4cfcfda7BA0dc8f646e4548E24E95A7` | 5,555 | 10,000 | 272 | [BaseScan](https://basescan.org/token/0x69832024e4cfcfda7BA0dc8f646e4548E24E95A7#balances) |
| XHEN | Magic Farm Base Chickens | `0x1Dd889ce472014CB4FA2154966b628B271d28C01` | 5,000 | 10,000 | 434 | [BaseScan](https://basescan.org/token/0x1Dd889ce472014CB4FA2154966b628B271d28C01#balances) |
