export type CollectionMetadata = {
  creator: string,
  name: string,
  description: string,
  image: string,
  mintType: 'OPEN_EDITION_721',
  cost: number,
  startTime: number,
  endTime: number,
}

export type Profile = {
  address: string;
  name: string;
  avatar: string;
}