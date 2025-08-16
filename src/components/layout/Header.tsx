import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { authClient } from "../../lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const handleSignOut = async () => {
    await authClient.signOut();
    // Invalidate session cache after sign out
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    window.location.href = "/";
  };

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
          {session?.data?.session && (
            <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm/6 font-semibold text-gray-900 hover:text-gray-600"
                  activeProps={{
                    className: "text-sm/6 font-semibold text-indigo-600",
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex">
          {isLoading ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : session?.data?.session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.data.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm/6 font-semibold text-gray-900 hover:text-gray-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm/6 font-semibold text-gray-900 hover:text-gray-600"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="-m-1.5 p-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">FM5 Manager</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              {session?.data?.session && (
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      activeProps={{
                        className:
                          "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-indigo-600 bg-indigo-50",
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
              <div className="py-6">
                {session?.data?.session ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 px-3">
                      {session.data.user?.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 w-full text-left"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
