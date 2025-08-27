import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
} from "react-aria-components";
import { ThemeToggle } from "../ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Products", href: "/products" },
  { name: "Models", href: "/models" },
  { name: "Filaments", href: "/filaments" },
  { name: "3MF Files", href: "/sliced-files" },
  { name: "Inventory", href: "/inventory" },
];

export default function Header() {
  return (
    <header className="bg-background w-full">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex items-center gap-x-12">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">FM5 Manager</span>
            <img
              alt=""
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary px-2 py-1.5 text-sm/6 font-semibold"
                activeProps={{
                  className:
                    "text-sm/6 font-semibold text-primary-foreground border border-primary px-2 bg-primary rounded-md",
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex lg:hidden">
            {/* <button */}
            {/*   type="button" */}
            {/*   onClick={() => setMobileMenuOpen(true)} */}
            {/*   className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" */}
            {/* > */}
            {/*   <span className="sr-only">Open main menu</span> */}
            {/*   <Bars3Icon aria-hidden="true" className="size-6" /> */}
            {/* </button> */}
            <DialogTrigger>
              <Button>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </Button>
              <Modal>
                <Dialog>
                  <Heading slot="title" />
                  <Button slot="close" />
                </Dialog>
              </Modal>
            </DialogTrigger>
          </div>
        </div>
      </nav>
    </header>
  );
}
