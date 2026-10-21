"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"

const navigation = [
  { name: "Home", href: ROUTES.HOME },
  { name: "About", href: ROUTES.ABOUT },
  { name: "Programs", href: ROUTES.PROGRAMS },
  { name: "Education", href: ROUTES.EDUCATION },
  { name: "Articles", href: ROUTES.BLOG },
  { name: "News & Research", href: ROUTES.NEWS },
  { name: "City Resources", href: ROUTES.CITY_RESOURCES },
  { name: "Contact", href: ROUTES.CONTACT },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label="Healthy Weight Literacy Foundation - Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-secondary">HWLF</span>
            <span className="sr-only">Healthy Weight Literacy Foundation</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex xl:items-center xl:gap-x-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
                  ? "text-primary"
                  : "text-secondary",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden xl:flex xl:items-center xl:gap-x-4">
          <Link href={ROUTES.DONATE}>
            <Button className="font-semibold">
              <Heart className="mr-2 h-4 w-4" />
              Donate
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 xl:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" aria-expanded={isOpen}>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-auto overflow-y-auto">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access navigation links and search functionality</SheetDescription>
              <div className="flex flex-col gap-6 pt-6 px-6">
                <Link href={ROUTES.HOME} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                    <Heart className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <span className="text-lg font-bold text-secondary">Healthy Weight Literacy Foundation</span>
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </form>

                <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "block text-lg font-medium transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1",
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
                          ? "text-primary"
                          : "text-secondary",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <Link href={ROUTES.DONATE} onClick={() => setIsOpen(false)}>
                  <Button className="font-semibold w-fit">
                    <Heart className="mr-2 h-4 w-4" />
                    Donate
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
