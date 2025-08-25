import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
} from "react-aria-components";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Products", href: "/products" },
  { name: "Models", href: "/models" },
  { name: "Filaments", href: "/filaments" },
  { name: "Inventory", href: "/inventory" },
  { name: "Profile", href: "/profile" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white">
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
                className="text-pewter-900 hover:text-pewter-600 px-2 py-1.5 text-sm/6 font-semibold"
                activeProps={{
                  className:
                    "text-sm/6 font-semibold !text-white border border-pewter-500 px-2 bg-pewter-500 rounded-md",
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
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
      </nav>
    </header>
  );
}
