import { Link } from "react-router";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/Icon";
import NewLetterForm from "../ui/newletter";

function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="mx-auto px-4 py-6 pb-8 pt-6 lg:px-0">
        <section className="flex flex-col justify-around gap-1 lg:ml-0 lg:flex-row lg:gap-8">
          <section className="mb-4 lg:mb-0">
            <Link to={"/"} className="flex items-center space-x-2">
              <Icons.logo className="size-6" />
              <span className="font-bold" aria-hidden={true}>
                {siteConfig.name}
              </span>
              <span className="sr-only">Home</span>
            </Link>
          </section>
          <section className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-10">
            {siteConfig?.footerNav.map((footer) => (
              <div key={footer.title} className="space-y-3">
                <h4 className="font-bold">{footer.title}</h4>
                <ul className="">
                  {footer.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        to={item.href}
                        target={item.external ? "_blank" : undefined}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {item.title}
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
          <section className="mb-4 space-y-2 lg:mb-0">
            <h4 className="font-bold">Subscribe to our newsletter.</h4>
            <NewLetterForm />
          </section>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
