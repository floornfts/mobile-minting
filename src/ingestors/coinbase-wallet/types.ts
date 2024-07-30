export type Collection = {
  network: string;
  address: string;
  name: string;
  imageUrl: string;
  stages: {
    stage: string;
    price: {
      Currency: {
        Contract: string;
        Decimals: string;
      };
      Amount: {
        Raw: string;
      };
    };
    startTime: string;
    endTime: string;
  }[];
  description: string;
  creatorAddress: string;
};

export type Profile = {
  address: string;
  name: string;
  avatar: string;
}