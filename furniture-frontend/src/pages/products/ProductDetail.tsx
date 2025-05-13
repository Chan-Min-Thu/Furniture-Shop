import React from "react";
import { useNavigate, useLoaderData } from "react-router";
// import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProductsCard from "@/components/products/ProductsCard";
import { Icons } from "@/components/Icon";
import Autoplay from "embla-carousel-autoplay";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fromatPrice } from "@/lib/utils";
import Rating from "@/components/products/Rating";
// with react-router
// import AddToFavourite from "@/components/products/AddToFavourite";
import AddToCartForm from "@/components/products/AddToCartForm";
import { oneProductQuery, productQuery } from "@/api/query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Image, Product } from "@/types";
import TanstackOptimistic from "@/components/products/TanstackOptimistic";
import { useCartStore } from "@/store/cartStore";
// import { Product } from "@/types";

const imageUrl = import.meta.env.VITE_IMAGE_URL;
function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useLoaderData();
  const { data: productData, status: productStatus } = useSuspenseQuery(
    oneProductQuery(productId),
  );
  const { data: productsData, status: productsStatus } = useSuspenseQuery(
    productQuery("?limit=3"),
  );

  const { addItem } = useCartStore();

  const handleCart = (quantity: number) => {
    addItem({
      id: Number(productData.data.id),
      name: productData.data.name,
      price: productData.data.price,
      image: productData.data.images[0].path,
      quantity: quantity,
    });
  };

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  );
  if (productStatus === "error" || productsStatus === "error") {
    return <p className="text-center text-red-500">There has an error.</p>;
  }
  if (productData.data) {
    return (
      <div className="container mx-auto px-4 md:px-0">
        <Button variant="outline" className="mt-8" onClick={() => navigate(-1)}>
          <Icons.arrowLeft />
          All Products
        </Button>
        <section className="my-6 flex flex-col gap-16 md:flex-row md:gap-16">
          <Carousel plugins={[plugin.current]} className="w-full md:w-1/2">
            <CarouselContent>
              {productData.data?.images.map((image: Image) => (
                <CarouselItem key={image.id}>
                  <img
                    src={imageUrl + image.path}
                    alt={productData.data.name}
                    loading="lazy"
                    decoding="async"
                    className="size-full rounded-md object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <Separator className="mt-4 md:hidden" />
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <div className="space-y-2">
              <h2 className="line-clamp-1 text-2xl font-bold">
                {productData.data?.name}
              </h2>
              <p className="text-base text-muted-foreground">
                {fromatPrice(Number(productData.data?.price))}
              </p>
            </div>
            <Separator className="my-1.5" />
            <p className="text-base text-muted-foreground">
              {productData.data?.inventory} in stock
            </p>
            <div className="flex items-center justify-between">
              <Rating rating={Number(productData.data?.rating)} />
              {/* <AddToFavourite
              rating={Number(productData.data?.rating)}
              productId={String(productData.data?.id)}
              isFavourite={productData.data?.users.length > 0}
            /> */}
              <TanstackOptimistic
                rating={Number(productData.data?.rating)}
                productId={String(productData.data?.id)}
                isFavourite={productData.data?.users.length > 0}
              />
            </div>
            <AddToCartForm
              canBuyNow={productData.data?.status === "active" ? true : false}
              onHandleCart={handleCart}
              idInCart={productData?.data?.id}
            />
            <Separator className="my-5" />
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  {productData.data?.description}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
        <section className="space-y-6 overflow-hidden">
          <h2 className="mb-4 mt-8 line-clamp-1 text-2xl font-bold">
            More Products from Furniture Shop
          </h2>
          <ScrollArea className="pb-8">
            <div className="flex gap-4">
              {productsData.products.map((product: Product) => (
                <ProductsCard
                  key={product.id}
                  product={product}
                  className="min-w-[260px]"
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      </div>
    );
  }
}
export default ProductDetail;
