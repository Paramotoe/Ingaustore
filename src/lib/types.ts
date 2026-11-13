export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  sortOrder?: number;
};

export type ProductImage = {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
};

export type ProductLink = {
  id: string;
  marketplaceName: string;
  url: string;
};

export type Product = {
  id: string;
  name: string;
  code: string | null;
  slug: string;
  description: string | null;
  priceIdr: number;
  isFeatured: boolean;
  isActive: boolean;
  category: Category;
  images: ProductImage[];
  links: ProductLink[];
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};