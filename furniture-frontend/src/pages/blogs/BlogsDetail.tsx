import { useLoaderData } from "react-router";
import { Link } from "react-router";
// import { posts } from "@/data/posts";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icon";
import RichRenderer from "@/components/blogs/RichRenderer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { onePostQuery, postQuery } from "@/api/query";
import { Post, Tag } from "@/types";

const imageUrl = import.meta.env.VITE_IMAGE_URL;
function BlogsDetail() {
  // const { postId } = useParams();
  // const post = posts.find((post) => post.id === postId);
  const { postId } = useLoaderData();
  const { data: postData, status: postStatus } = useSuspenseQuery(
    onePostQuery(postId),
  );
  const { data: postsData, status: postsStatus } = useSuspenseQuery(
    postQuery("?limit=6"),
  );

  if (postStatus === "error" || postsStatus === "error") {
    return <p className="text-center text-red-500">There has an error.</p>;
  }
  return (
    <div className="container mx-auto px-4 lg:px-0">
      <section className="flex flex-col lg:flex-row">
        <section className="w-full pr-16 lg:w-3/4">
          <Button variant="outline" asChild className="mb-6 mt-8">
            <Link to={"/blogs"}>
              <Icons.arrowLeft />
              All Blogs
            </Link>
          </Button>
          {postData.post ? (
            <>
              <h2 className="text-3xl font-extrabold">{postData.post.title}</h2>
              <div className="mt-2 text-sm">
                <span>
                  by{" "}
                  <span className="font-[600]">
                    {" "}
                    {postData.post.user.fullName}
                  </span>{" "}
                  on
                  <span className="font-[600]"> {postData.post.updatedAt}</span>
                </span>
              </div>
              <h3 className="my-6 text-base font-[400]">
                {postData.post.content}
              </h3>
              <img
                src={imageUrl + postData.post.image}
                alt={postData.post.title}
                loading="lazy"
                decoding="async"
                className="w-full rounded-xl"
              />
              <RichRenderer content={postData.post.body} className="my-8" />
              <div className="mb-12 space-x-2">
                {postData.post.tags.map((tag: Tag) => (
                  <Button key={tag.name} variant="secondary">
                    {tag.name}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="mb-16 mt-8 text-center font-bold text-muted-foreground lg:mt-24">
              No Post Found.
            </p>
          )}
        </section>
        <section className="mb-16 w-full lg:mt-24 lg:w-1/4">
          <div className="mb-8 flex items-center gap-2 font-semibold">
            <Icons.layers />
            <h2 className="text-xl">Other Blog Posts</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-1">
            {postsData.posts.map((post: Post) => (
              <Link
                to={`/blogs/${post.id}`}
                key={post.id}
                className="flex items-start gap-2"
              >
                <img
                  src={imageUrl + post.image}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="w-1/4 rounded"
                />
                <div className="w-3/4 text-xs font-[400] text-muted-foreground">
                  <p className="line-clamp-2">{post.content}</p>
                  <i>...see more</i>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

export default BlogsDetail;
