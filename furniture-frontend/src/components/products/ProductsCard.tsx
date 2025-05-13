import { Link } from "react-router";
import { Icons } from "@/components/Icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/types";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { fromatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

interface ProductsProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Product;
}
const imageUrl = import.meta.env.VITE_IMAGE_URL;
function ProductsCard({ product, className }: ProductsProps) {
  const { carts, addItem } = useCartStore();
  const isCart = carts.find((item) => item.id === Number(product.id));

  const handleAddToCart = () => {
    addItem({
      id: Number(product!.id),
      name: product.name,
      image: product.images[0].path,
      price: product.price,
      quantity: 1,
    });
  };
  return (
    <Card className={cn("size-full overflow-hidden rounded-lg", className)}>
      <Link to={`/products/${product.id}`}>
        <CardHeader className="border-b p-0">
          <AspectRatio ratio={1 / 1} className="bg-muted">
            <img
              src={imageUrl + product.images[0].path}
              alt={product.name}
              decoding="async"
              className="h-full object-contain"
              loading="lazy"
            />
          </AspectRatio>
        </CardHeader>
        <CardContent className="mt-4 space-y-2">
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <CardDescription>
            {fromatPrice(product.price)}
            {product.discount > 0 && (
              <span className="ml-2 font-extralight line-through">
                {fromatPrice(product.discount)}
              </span>
            )}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="flex">
        {product.status === "INACTIVE" ? (
          <Button
            disabled={true}
            size="sm"
            aria-label="Sold out"
            className="w-full bg-muted-foreground"
          >
            Sold Out
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="w-full bg-own"
            aria-label="Add To Cart"
            disabled={isCart ? true : false}
          >
            {!isCart && <Icons.plus />} {isCart ? "Added Cart" : "Add To Cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProductsCard;
