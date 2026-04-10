export interface AgentListing {
  tokenId: number;
  ownerAddress: string;
  priceForge?: number;
  rentalRateForge?: number;
  listedAt: string;
  isRentable: boolean;
  isPurchasable: boolean;
}

export interface RentalListingRequest {
  tokenId: number;
  dailyRate: number;
  maxDurationDays: number;
}

export interface PlatformStats {
  agentsMinted: number;
  forgeEarned: number;
  contentTraded: number;
}
