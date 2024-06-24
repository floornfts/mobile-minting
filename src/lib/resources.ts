import { Alchemy, Network } from "alchemy-sdk";
import { MintIngestorResources } from "./types/mint-ingestor";
import axios from "axios";

export const mintIngestorResources = (): MintIngestorResources => {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
    if (!ALCHEMY_API_KEY) {
        throw new Error('ALCHEMY_API_KEY environment variable is not set (copy .env.sample to .env and fill in the correct values)');
    }
    const settings = {
      apiKey: ALCHEMY_API_KEY,
      network: Network.BASE_MAINNET, // Replace with the correct network
    };
    const alchemy = new Alchemy(settings);
  
    return {
      alchemy,
      fetcher: axios,
    };
  };