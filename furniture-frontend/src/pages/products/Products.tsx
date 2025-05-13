import { useSearchParams } from "react-router";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
// import { products, filterList } from "@/data/products";
import ProductsCard from "@/components/products/ProductsCard";
import ProductFilter from "@/components/products/ProductFilter";
// import Pagination from "@/components/products/Pagination";
import {
  categoryAndTypeQuery,
  productInfiniteQuery,
  queryClient,
} from "@/api/query";
import { Button } from "@/components/ui/button";
import useFilterStore from "@/store/filterStore";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = useFilterStore((state) => state.category);
  console.log(category);
  const types = useFilterStore((state) => state.type);
  // const rawCategories = searchParams.get("categories");
  // const rawTypes = searchParams.get("types");
  // console.log(rawCategories);
  const selectedCategories = category
    ? category
        .map((cat) => Number(cat.trim()))
        .filter((cat) => !isNaN(cat))
        .map((cat) => cat.toString())
    : [];
  // const selectedTypes = rawTypes
  //   ? decodeURIComponent(rawTypes)
  //       .split(",")
  const selectedTypes = types
    ? types
        .map((type) => Number(type.trim()))
        .filter((type) => !isNaN(type))
        .map((type) => type.toString())
    : [];

  const cat =
    selectedCategories.length > 0 ? selectedCategories.join(",") : null;
  const type = selectedTypes.length > 0 ? selectedTypes.join(",") : null;
  const { data: categoryType } = useSuspenseQuery(categoryAndTypeQuery());
  const {
    status,
    data,
    error,
    isFetching,
    fetchNextPage,
    // fetchPreviousPage,
    hasNextPage,
    isFetchingNextPage,
    // isPreviousData,
    refetch,
  } = useInfiniteQuery(productInfiniteQuery(cat, type));

  const allProducts = data?.pages.flatMap((page) => page?.products ?? []);

  const handleSearchParams = (categories: string[], types: string[]) => {
    const newParams = new URLSearchParams();
    if (categories.length > 0) {
      newParams.set("categories", encodeURIComponent(categories.join(",")));
    }
    if (types.length > 0) {
      newParams.set("types", encodeURIComponent(types.join(",")));
    }
    //Updating the URL by SearchParams and triggering and refetching with  via query key
    setSearchParams(newParams);
    //canceling the previous query
    queryClient.cancelQueries({ queryKey: ["products", "infinite"] });
    //removinth cached data
    queryClient.removeQueries({ queryKey: ["products", "infinite"] });
    refetch();
  };
  return status === "pending" ? (
    <p>Loading...</p>
  ) : status === "error" ? (
    <p>{error.message}</p>
  ) : (
    <div className="container mx-auto">
      <section className="flex flex-col lg:flex-row">
        <section className="my-8 ml-4 w-full lg:ml-0 lg:w-1/5">
          <ProductFilter
            filterList={categoryType}
            selectedCategories={selectedCategories}
            selectedTypes={selectedTypes}
            onFilterChange={handleSearchParams}
          />
        </section>
        <section className="ml-4 w-full lg:ml-0 lg:w-4/5">
          <h1 className="mb-8 text-2xl font-bold">All Products</h1>
          <div className="gap-y-12I l g:grid-cols-3 mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {allProducts &&
              allProducts.map((product) => (
                <ProductsCard product={product} key={product.id} />
              ))}
          </div>
          {/* <div className="">
            <Pagination />
          </div> */}
          <div className="my-4 flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              variant={!hasNextPage ? "ghost" : "secondary"}
            >
              {isFetchingNextPage
                ? "Loading More..."
                : hasNextPage
                  ? "Read More"
                  : "Nothing More To Read."}
            </Button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? "Background Updating..."
              : null}
          </div>
        </section>
      </section>
    </div>
  );
}

export default Products;
