import { Contract } from 'alchemy-sdk';
import { getAddress, getCreate2Address, hexlify, keccak256, toUtf8Bytes } from 'ethers';
import { MintIngestorResources } from '../../lib/types/mint-ingestor';
import { MintClubEligibilityDetails, MintClubMetadata, MintClubTokenDetails, MintClubTokenInfo } from './types';

export const MINTCLUB_BASE_CHAIN_ID = 8453;
export const MINTCLUB_BOND_ADDRESS = '0xc5a076cad94176c2996B32d8466Be1cE757FAa27';
export const MINTCLUB_ZAP_ADDRESS = '0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa';
export const MINTCLUB_WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
export const MINTCLUB_ERC1155_IMPLEMENTATION_ADDRESS = '0x6c61918eECcC306D35247338FDcf025af0f6120A';

const MINTCLUB_HOSTS = new Set(['mint.club', 'www.mint.club']);

const BOND_ABI = [
  'function exists(address token) view returns (bool)',
  'function getDetail(address token) view returns (tuple(uint16 mintRoyalty,uint16 burnRoyalty,tuple(address creator,address token,uint8 decimals,string symbol,string name,uint40 createdAt,uint128 currentSupply,uint128 maxSupply,uint128 priceForNextMint,address reserveToken,uint8 reserveDecimals,string reserveSymbol,string reserveName,uint256 reserveBalance) info,tuple(uint128 rangeTo,uint128 price)[] steps) detail)',
  'function getReserveForToken(address token,uint256 tokensToMint) view returns (uint256 reserveAmount,uint256 royalty)',
];

export const mintClubUrlForSymbol = (symbol: string): string => {
  return `https://mint.club/nft/base/${encodeURIComponent(symbol)}`;
};

export const mintClubSymbolFromUrl = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);
    if (!MINTCLUB_HOSTS.has(parsed.hostname)) {
      return;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length !== 3 || parts[0] !== 'nft' || parts[1] !== 'base') {
      return;
    }

    return decodeURIComponent(parts[2]);
  } catch (error) {
    return;
  }
};

export const computeMintClubBase1155Address = (symbol: string): string => {
  const hexedSymbol = hexlify(toUtf8Bytes(symbol));
  const packed = `0x${[MINTCLUB_BOND_ADDRESS, hexedSymbol]
    .map((value) => value.replace(/^0x/, ''))
    .join('')
    .toLowerCase()}`;
  const salt = keccak256(packed);
  const creationCode = [
    '0x3d602d80600a3d3981f3363d3d373d3d3d363d73',
    MINTCLUB_ERC1155_IMPLEMENTATION_ADDRESS.replace(/^0x/, '').toLowerCase(),
    '5af43d82803e903d91602b57fd5bf3',
  ].join('');

  return getCreate2Address(MINTCLUB_BOND_ADDRESS, salt, keccak256(creationCode));
};

export const resolveMintClubTokenForSymbol = async (
  resources: MintIngestorResources,
  symbol: string,
): Promise<MintClubTokenDetails | undefined> => {
  const tokenAddress = computeMintClubBase1155Address(symbol);
  const details = await getMintClubTokenDetails(resources, tokenAddress);
  if (!details || details.info.symbol !== symbol) {
    return;
  }

  return details;
};

export const getMintClubTokenDetails = async (
  resources: MintIngestorResources,
  tokenAddress: string,
): Promise<MintClubTokenDetails | undefined> => {
  const normalizedAddress = normalizeAddress(tokenAddress);
  if (!normalizedAddress) {
    return;
  }

  try {
    const bondContract = await getMintClubBondContract(resources);
    const exists = await readTokenExists(bondContract, normalizedAddress);
    if (!exists) {
      return;
    }

    const detail = await readTokenDetail(bondContract, normalizedAddress);
    const info = tokenInfoFromDetail(detail);
    if (!isMintableWethErc1155(info)) {
      return;
    }

    const reserve = await readReserveQuote(bondContract, normalizedAddress);
    const tokenDetails: MintClubTokenDetails = {
      mintRoyalty: Number(detail.mintRoyalty),
      burnRoyalty: Number(detail.burnRoyalty),
      info,
      reserveAmount: reserve.reserveAmount,
      royaltyAmount: reserve.royaltyAmount,
      metadata: await getMintClubMetadata(resources, normalizedAddress),
    };

    return tokenDetails;
  } catch (error) {
    return;
  }
};

export const getMintClubEligibilityDetails = async (
  resources: MintIngestorResources,
  tokenAddress: string,
): Promise<MintClubEligibilityDetails | undefined> => {
  const normalizedAddress = normalizeAddress(tokenAddress);
  if (!normalizedAddress) {
    return;
  }

  try {
    const bondContract = await getMintClubBondContract(resources);
    const detail = await readTokenDetail(bondContract, normalizedAddress);
    const info = tokenInfoFromDetail(detail);
    const details: MintClubEligibilityDetails = {
      token: info.token,
      symbol: info.symbol,
      currentSupply: info.currentSupply,
      maxSupply: info.maxSupply,
      reserveToken: info.reserveToken,
    };

    if (info.decimals !== 0 || !sameAddress(info.reserveToken, MINTCLUB_WETH_ADDRESS)) {
      return;
    }

    return details;
  } catch (error) {
    return;
  }
};

export const getMintClubMetadata = async (
  resources: MintIngestorResources,
  tokenAddress: string,
): Promise<MintClubMetadata | undefined> => {
  try {
    const response = await resources.fetcher.get('https://mint.club/api/metadata', {
      params: {
        chainId: MINTCLUB_BASE_CHAIN_ID,
        tokenAddress,
      },
    });
    return response.data;
  } catch (error) {
    return;
  }
};

export const mintClubFeaturedImageUrl = (details: MintClubTokenDetails): string => {
  return (
    details.metadata?.logo ||
    details.metadata?.backgroundImage ||
    `https://mint.club/api/og/token/nft/base/${encodeURIComponent(details.info.symbol)}`
  );
};

export const mintClubDescription = (details: MintClubTokenDetails): string => {
  return `${details.info.name} (${details.info.symbol}) is a Bonding Curved ERC-1155 token on Base Network.`;
};

export const isMintableWethErc1155 = (info: MintClubTokenInfo): boolean => {
  if (info.decimals !== 0) {
    return false;
  }
  if (!sameAddress(info.reserveToken, MINTCLUB_WETH_ADDRESS)) {
    return false;
  }
  if (info.currentSupply <= 10n) {
    return false;
  }
  if (info.maxSupply > 0n && info.currentSupply >= info.maxSupply) {
    return false;
  }
  return true;
};

export const sameAddress = (left: string, right: string): boolean => {
  const normalizedLeft = normalizeAddress(left);
  const normalizedRight = normalizeAddress(right);
  return !!normalizedLeft && !!normalizedRight && normalizedLeft === normalizedRight;
};

const normalizeAddress = (address: string): string | undefined => {
  try {
    return getAddress(address);
  } catch (error) {
    return;
  }
};

const getMintClubBondContract = async (resources: MintIngestorResources): Promise<Contract> => {
  const ethersProvider = await resources.alchemy.config.getProvider();
  return new Contract(MINTCLUB_BOND_ADDRESS, BOND_ABI, ethersProvider);
};

const readTokenExists = async (bondContract: Contract, tokenAddress: string): Promise<boolean> => {
  const exists = await withRetry(() => bondContract.functions.exists(tokenAddress));
  return !!exists[0];
};

const readTokenDetail = async (bondContract: Contract, tokenAddress: string): Promise<any> => {
  const detail = await withRetry(() => bondContract.functions.getDetail(tokenAddress));
  return detail[0];
};

const readReserveQuote = async (
  bondContract: Contract,
  tokenAddress: string,
): Promise<{ reserveAmount: bigint; royaltyAmount: bigint }> => {
  const reserve = await withRetry(() => bondContract.functions.getReserveForToken(tokenAddress, 1));
  return {
    reserveAmount: toBigInt(reserve.reserveAmount || reserve[0]),
    royaltyAmount: toBigInt(reserve.royalty || reserve[1]),
  };
};

const tokenInfoFromDetail = (detail: any): MintClubTokenInfo => {
  const info = detail.info;
  return {
    creator: info.creator,
    token: info.token,
    decimals: Number(info.decimals),
    symbol: info.symbol,
    name: info.name,
    createdAt: Number(info.createdAt),
    currentSupply: toBigInt(info.currentSupply),
    maxSupply: toBigInt(info.maxSupply),
    priceForNextMint: toBigInt(info.priceForNextMint),
    reserveToken: info.reserveToken,
    reserveSymbol: info.reserveSymbol,
  };
};

const toBigInt = (value: unknown): bigint => {
  if (typeof value === 'bigint') {
    return value;
  }
  return BigInt(String(value || '0'));
};

const withRetry = async <T>(read: () => Promise<T>, attempt = 0): Promise<T> => {
  try {
    return await read();
  } catch (error) {
    if (attempt >= 3) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    return withRetry(read, attempt + 1);
  }
};
