// import { posts } from "@/data/posts";
import BlogPostsList from "@/components/blogs/BlogPostsList";
import { useInfiniteQuery } from "@tanstack/react-query";
import { postInfiniteQuery } from "@/api/query";
import { Button } from "@/components/ui/button";

function Blogs() {
  const {
    status,
    data,
    error,
    isFetching,
    fetchNextPage,
    // fetchPreviousPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(postInfiniteQuery());

  const allPosts = data?.pages.flatMap((page) => page?.posts ?? []);
  return status === "pending" ? (
    <p>Loading...</p>
  ) : status === "error" ? (
    <p>{error.message}</p>
  ) : (
    <div className="container mx-auto">
      <h1 className="my-8 text-center text-2xl font-bold md:text-left">
        Latest Blogs Posts
      </h1>
      {allPosts && <BlogPostsList posts={allPosts} />}
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
        {isFetching && !isFetchingNextPage ? "Background Updating..." : null}
      </div>
    </div>
  );
}

export default Blogs;
