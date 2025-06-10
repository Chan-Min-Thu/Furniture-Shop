export interface NavItem {
  title: string;
  href?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  card: NavItem[];
  menu: NavItem[];
}
export type MainNavItem = NavItemWithChildren;

export type Image = {
  id: number;
  path: string;
};

export type Product = {
  id?: number;
  name: string;
  description: string;
  images: Image[];
  categoryId: string;
  price: number;
  discount: number;
  rating: number;
  inventory: number;
  status: string;
};

export type Author = {
  fullName: string;
};
export type Tag = {
  name: string;
};
export type Post = {
  id: number;
  user: Author;
  title: string;
  content: string;
  image: string;
  body: string;
  updatedAt: string;
  tags: Tag[];
};

export type Category = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  image: string;
};

export type Cart = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};
