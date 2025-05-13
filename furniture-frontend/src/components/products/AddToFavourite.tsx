import { useFetcher } from "react-router";

import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { Icons } from "@/components/Icon";

interface FavouriteProps extends ButtonProps {
  productId: string;
  rating: number;
  isFavourite: boolean;
}
function AddToFavourite({
  productId,
  // rating,
  isFavourite,
  className,
  ...props
}: FavouriteProps) {
  const fetcher = useFetcher({ key: `products/${productId}` });
  let favourite = isFavourite;
  if (fetcher.formData) {
    favourite = fetcher.formData.get("favourite") === "true";
  }
  return (
    <fetcher.Form method="post">
      <Button
        variant="secondary"
        size="icon"
        name="favourite"
        value={favourite ? "false" : "true"}
        className={cn("size-8 shrink-0", className)}
        {...props}
      >
        {favourite ? (
          <Icons.heartFilled className="size-4 text-red-500" />
        ) : (
          <Icons.heart className="size-4 text-red-500" />
        )}
      </Button>
    </fetcher.Form>
  );
}

export default AddToFavourite;
