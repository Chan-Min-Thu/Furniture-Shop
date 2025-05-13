import { useIsFetching, useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { Icons } from "@/components/Icon";
import api from "@/api";
import { queryClient } from "@/api/query";

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
  const fetching = useIsFetching() > 0;
  let favourite = isFavourite;
  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const data = {
        id: Number(productId),
        favourite: !isFavourite,
      };
      const response = await api.patch("user/products/toggleFavourite", data);
      if (response.status !== 200) {
        console.log(response.data);
      }
      return response.data;
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: ["products", "detail", productId],
    //   });
    // },
    // onError:()=>{}
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", "detail", productId],
      });
    },
  });
  if (isPending || fetching) {
    favourite = !isFavourite;
  }
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => mutate()}
      className={cn("size-8 shrink-0", className)}
      {...props}
    >
      {favourite ? (
        <Icons.heartFilled className="size-4 text-red-500" />
      ) : (
        <Icons.heart className="size-4 text-red-500" />
      )}
    </Button>
  );
}

export default AddToFavourite;
