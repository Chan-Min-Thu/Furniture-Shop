import Header from "@/components/layouts/Header";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import Footer from "@/components/layouts/Footer";
import { Icons } from "@/components/Icon";

function Error() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="my-32 flex flex-1 items-center justify-center">
        <Card className="w-[350px] md:w-[500px] lg:w-[500px]">
          <CardHeader className="flex place-items-center gap-2">
            <div className="mb-4 grid size-24 place-items-center rounded-full border border-dashed">
              <Icons.exclamation className="size-10 text-muted-foreground/70" />
            </div>
            <CardTitle>Opps!</CardTitle>
            <CardDescription>An Error occured accidently.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant={"outline"} asChild>
              <Link to={"/"}>Go to home Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default Error;
