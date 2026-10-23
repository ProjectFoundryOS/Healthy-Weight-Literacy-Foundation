"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Brand } from "./brand";

const navigation = [
  { name: "Learn", href: "/education" },
  { name: "Articles", href: "/blog" },
  { name: "News & Research", href: "/news" },
  { name: "Tools", href: "/tools" },
  { name: "About", href: "/about" },
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/95 backdrop-blur-md print:static">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="WeightLiteracy home" className="rounded-md">
          <Brand />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-primary-soft ${active(item.href) ? "text-primary bg-primary-soft" : "text-secondary"}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            aria-label="Search WeightLiteracy"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-primary-soft"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Button asChild variant="outline" className="hidden xl:inline-flex">
            <Link href="/donate">Support us</Link>
          </Button>
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[min(100vw,390px)] overflow-y-auto px-6 pb-8 pt-16"
              >
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription>
                  Explore clear answers for weight health.
                </SheetDescription>
                <form
                  action="/search"
                  onSubmit={() => setOpen(false)}
                  className="mt-4"
                >
                  <label
                    htmlFor="menu-search"
                    className="mb-2 block text-sm font-medium"
                  >
                    Search articles and news
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="menu-search"
                      name="q"
                      type="search"
                      placeholder="Try GLP-1 or nutrition"
                      className="min-w-0 flex-1 rounded-md border border-input bg-white px-3 py-3"
                    />
                    <Button type="submit" size="icon" aria-label="Search">
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
                <nav
                  aria-label="Mobile navigation"
                  className="mt-2 divide-y divide-border"
                >
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active(item.href) ? "page" : undefined}
                      className={`block rounded-sm py-4 text-lg ${active(item.href) ? "font-semibold text-primary" : "text-secondary"}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="block py-4 text-lg"
                  >
                    Contact
                  </Link>
                </nav>
                <Button asChild>
                  <Link href="/donate" onClick={() => setOpen(false)}>
                    Support free education
                  </Link>
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
