import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
export function SiteSearch({ id = "topic-search" }: { id?: string }) {
  return (
    <form action="/search" className="max-w-xl">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        What would you like to understand?
      </label>
      <div className="flex gap-2 rounded-xl border border-input bg-white p-1.5 shadow-sm">
        <input
          id={id}
          name="q"
          type="search"
          placeholder="Try GLP-1, food noise, or side effects"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-3 text-base outline-offset-0"
        />
        <Button type="submit" size="icon" aria-label="Search articles and news">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
