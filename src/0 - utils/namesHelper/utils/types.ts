export type NameInfo = {
  id: PlayerId;
  fromDate: string;
  endDate: string;
};

export type NamesList = Record<PlayerName, NameInfo>;
