export interface Book {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  status: string;
  publicationDate: string;
  mrp: string | number;
  authorRoyaltyPerCopy: string | number;
  totalCopiesSold: number;
  totalRoyaltyEarned: string | number;
  royaltyPaid: string | number;
  royaltyPending: string | number;
  lastRoyaltyPayoutDate?: string | null;
  printPartner?: string | null;
  availableOn?: string[];
  authorId?: string;
}
