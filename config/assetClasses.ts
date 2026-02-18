export type AssetClass = {
  id: string;
  label: string;
  adrMin: number; // % average daily range minimum
  adrMax: number; // % average daily range maximum
  adrTypical: number; // midpoint used in scoring
};

export const ASSET_CLASSES: AssetClass[] = [
  {
    id: "forex",
    label: "Forex",
    adrMin: 0.5,
    adrMax: 1.5,
    adrTypical: 1.0,
  },
  {
    id: "stocks_large",
    label: "Large Cap Stocks",
    adrMin: 1.0,
    adrMax: 3.0,
    adrTypical: 2.0,
  },
  {
    id: "stocks_small",
    label: "Small Cap Stocks",
    adrMin: 3.0,
    adrMax: 8.0,
    adrTypical: 5.5,
  },
  {
    id: "crypto",
    label: "Crypto",
    adrMin: 5.0,
    adrMax: 12.0,
    adrTypical: 8.5,
  },
  {
    id: "indices",
    label: "Indices (SPX, NQ, etc.)",
    adrMin: 0.8,
    adrMax: 2.0,
    adrTypical: 1.4,
  },
  {
    id: "commodities",
    label: "Commodities (Oil, Gold)",
    adrMin: 1.0,
    adrMax: 3.5,
    adrTypical: 2.0,
  },
];

export const ASSET_CLASS_MAP = Object.fromEntries(
  ASSET_CLASSES.map((a) => [a.id, a])
) as Record<string, AssetClass>;
