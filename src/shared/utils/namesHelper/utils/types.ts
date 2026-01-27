export type NameInfo = {
  id: PlayerId;
  name: string;
  fromDate: string;
  endDate: string;
};

export type NamesList = Record<PlayerName, NameInfo>;
