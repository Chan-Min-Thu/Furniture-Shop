import { Post } from "@/types";
import { Link } from "react-router";

interface BlogCardProps {
  posts: Post[];
}
const imageUrl = import.meta.env.VITE_IMAGE_URL;
function BlogCard({ posts }: BlogCardProps) {
  return (
    <div className="mb-16 grid grid-cols-1 gap-16 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-3">
      {posts?.map((post) => (
        <Link to={`/blogs/${post.id}`} key={Number(post.id)}>
          <img
            src={imageUrl + post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="mb-4 w-full rounded-md"
          />
          <h3 className="line-clamp-1 font-extrabold">{post.title}</h3>
          <h3 className="my-4 line-clamp-3 text-base font-[400]">
            {post.content}
          </h3>
          <div className="text-sm">
            <span>
              by <span className="font-[600]"> {post.user.fullName}</span> on
              <span className="font-[600]"> {post.updatedAt}</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default BlogCard;
