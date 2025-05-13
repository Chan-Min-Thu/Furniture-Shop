import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types";
import { Link } from "react-router";

interface CarouselCardProps {
  products: Product[];
}
const imageUrl = import.meta.env.VITE_IMAGE_URL;
export default function CarouselCard({ products }: CarouselCardProps) {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-1">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-1 lg:basis-1/3">
            <div className="flex gap-4 p-4 px-4">
              <img
                src={imageUrl + product.images[0].path}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-28 rounded-md"
              />
              <div>
                <h4 className="text-sm font-bold">{product.name}</h4>
                <p className="my-2 line-clamp-2 text-sm text-gray-600">
                  {/* The line-clamp-2 class is used to truncate the text to 2 lines because of tailwind support.*/}
                  {/* {product.description.length > 55
                    ? product.description.substring(0, 55) + "..."
                    : product.description} */}
                  {product.description}
                </p>
                <Link
                  to={`/products/${product.id}`}
                  className="text-sm font-semibold text-own hover:underline"
                >
                  Read More
                </Link>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
