import { Link } from "react-router";
import { Icons } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "../ui/scroll-area";
// import { cartItems } from "@/data/cart";
import CartItem from "../carts/CartItem";
import { fromatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Cart } from "@/types";

export default function CartSheet() {
  // const itemsCount = 4;
  // const amountTotal = 190;

  const itemsCount = useCartStore((state) => state.getTotalItems());
  const amountTotal = useCartStore((state) => state.getTotalPrice());
  const { carts } = useCartStore();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Open cart"
        >
          {itemsCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 size-6 justify-center rounded-full p-2.5"
            >
              {itemsCount}
            </Badge>
          )}
          <Icons.cart className="size-4" aria-hidden={true} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {" "}
            {itemsCount ? `Cart - ${itemsCount}` : "Empty Cart"}
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-2" />
        {carts.length > 0 ? (
          <>
            <ScrollArea className="my-4 h-[70vh] pb-8">
              <div>
                {carts.map((item: Cart) => (
                  <CartItem key={item.id} cart={item} />
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-4">
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{fromatPrice(amountTotal)}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit" className="w-full" asChild>
                    <Link to={"/checkout"} aria-label="Check out">
                      Continue to Checkout
                    </Link>
                  </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col place-items-center justify-center space-y-1">
            <Icons.cart className="mb-4 size-16 text-muted-foreground" />
            <div className="text-muted-foreground">Your cart is empty.</div>
          </div>
        )}
        <ScrollArea></ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
