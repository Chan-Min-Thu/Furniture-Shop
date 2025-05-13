import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import Coach from "@/data/images/couch.png";
import { Button } from "@/components/ui/button";
import CarouselCard from "@/components/products/CarouselCard";
// import { products } from "@/data/products";
// import { posts } from "@/data/posts";
import BlogCard from "@/components/blogs/BlogCard";
import ProductsCard from "@/components/products/ProductsCard";
import { Product } from "@/types";
import { postQuery, productQuery } from "@/api/query";
import useFilterStore from "@/store/filterStore";
// import { Skeleton } from "@/components/ui/skeleton";

// const simplePosts = posts.slice(0, 3);
// const simpleProducts = products.slice(0, 4);

function Home() {
  // const { productData, postData } = useLoaderData();
  // const {
  //   data: productData,
  //   isLoading: isProductLoading,
  //   isError: isProductError,
  //   error: productError,
  //   refetch: productRefetch,
  // } = useQuery(productQuery("?limit=8"));
  // const {
  //   data: postData,
  //   isLoading: isPostLoading,
  //   isError: isPostError,
  //   error: postError,
  //   refetch: postRefetch,
  // } = useQuery(postQuery("?limit=3"));
  // if (isProductLoading && isPostLoading) {
  //   return (
  //     <div className="container mx-auto mt-6 place-items-center">
  //       <Skeleton className="h-12 w-12 rounded-full" />
  //       <div className="space-y-2">
  //         <Skeleton className="h-4 w-[250px]" />
  //         <Skeleton className="h-4 w-[200px]" />
  //       </div>
  //     </div>
  //   );
  // }
  // if (isProductError && isPostError) {
  //   return (
  //     <div className="container mx-auto place-items-center">
  //       <div className="mb-4 text-center">
  //         <p className="text-xl">{postError.message || productError.message}</p>
  //       </div>
  //       <Button
  //         onClick={() => {
  //           productRefetch();
  //           postRefetch();
  //         }}
  //       >
  //         Retry
  //       </Button>
  //     </div>
  //   );
  // }
  const { data: postData } = useSuspenseQuery(postQuery("?limit=3"));
  const { data: productData } = useSuspenseQuery(productQuery("?limit=8"));
  const Title = ({
    title,
    href,
    sideText,
  }: {
    title: string;
    href: string;
    sideText: string;
  }) => {
    const navigate = useNavigate();
    const categories = useFilterStore((state) => state.category);
    const types = useFilterStore((state) => state.type);
    // const [searchParams, setSearchParams] = useSearchParams();
    const handleClick = () => {
      const newParams = new URLSearchParams();
      if (categories.length > 0) {
        newParams.set("categories", encodeURIComponent(categories.join(",")));
      }
      if (types.length > 0) {
        newParams.set("types", encodeURIComponent(types.join(",")));
      }
      //Updating the URL by SearchParams and triggering and refetching with  via query key
      // setSearchParams(newParams);
      navigate(`${href}?${newParams.toString()}`);
    };
    return (
      <div className="mb-20 mt-10 flex flex-col px-4 md:flex-row md:justify-between md:px-0">
        <h2 className="mb-4 text-2xl font-bold md:mb-0">{title}</h2>
        <button
          onClick={handleClick}
          className="font-semibold text-muted-foreground underline"
        >
          {sideText}
        </button>
      </div>
    );
  };
  if (productData && postData) {
    return (
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between">
          {/* Text Section */}
          <div className="my-8 text-center lg:mb-0 lg:mt-16 lg:w-2/5 lg:text-left">
            <h1 className="m mb-4 text-4xl font-extrabold text-own lg:text-6xl">
              Modern Interior Design Studio
            </h1>
            <p className="mb-6 text-own lg:mb-8">
              Furniture is an essential component of any living space, providing
              functionality, confort and aesthetic appeal.
            </p>
            <div className="mt-4 flex justify-center gap-4 lg:justify-start">
              <Button
                asChild
                className="rounded-full bg-orange-300 px-8 py-6 text-base"
              >
                <Link to="">Shop Now</Link>
              </Button>
              <Button
                asChild
                className="rounded-full px-8 py-6 text-base text-own"
                variant={"outline"}
              >
                <Link to={""}>Explore</Link>
              </Button>
            </div>
          </div>
          {/* images */}
          <img src={Coach} alt="Coach" className="w-full lg:w-3/5" />
        </div>
        <CarouselCard products={productData.products} />
        <Title
          title="Featured Products"
          href={"/products"}
          sideText="View All Products"
        />
        <div className="mx-auto grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-4">
          {productData.products.slice(0, 4).map((product: Product) => (
            <ProductsCard key={product.id} product={product} />
          ))}
        </div>
        <Title title="Recent Blog" href={"/blogs"} sideText="View All Posts" />
        <BlogCard posts={postData?.posts} />
      </div>
    );
  }
}

export default Home;
