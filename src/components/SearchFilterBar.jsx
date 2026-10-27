import { useMemo, useRef, useState } from "react";
import { ArrowUpAZ, ArrowDownAZ, Search } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/DropdownMenu";

/**
 * Search box + optional sort menu + live results list.
 *
 * Props:
 *  - data           { id, title, description, tags?, keywords?, href?, image?, meta? }[]
 *                   Every word typed must appear in the title, description, tags or keywords.
 *                   `href` makes the title a link, `image` adds a thumbnail, `meta` (a price) sits on the right.
 *  - placeholder, autoFocus
 *  - showSort       show the A–Z / Z–A menu (default true)
 *  - maxResults     cap the number of rows
 *  - idleContent    shown instead of the list while the box is empty
 *  - emptyMessage   (query) => node, shown when nothing matches
 *  - onSelect(item) called when a result is opened (click or Enter)
 *  - className, listClassName
 *
 * Keyboard: Enter opens the first result, ArrowDown moves into the list, ArrowUp/Down move between
 * results, ArrowUp on the first result returns to the box.
 */
const SearchComponent = ({
  data = [],
  placeholder = "Search...",
  autoFocus = false,
  showSort = true,
  maxResults,
  idleContent,
  emptyMessage,
  onSelect,
  className,
  listClassName = "max-h-72",
}) => {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "" | "asc" | "desc"
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const trimmed = query.trim();
  const results = useMemo(() => {
    const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    let list = tokens.length
      ? data.filter((item) => {
          const haystack = [item.title, item.description, ...(item.tags ?? []), ...(item.keywords ?? [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return tokens.every((token) => haystack.includes(token));
        })
      : [...data];
    if (sortOrder === "asc") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOrder === "desc") list.sort((a, b) => b.title.localeCompare(a.title));
    return maxResults ? list.slice(0, maxResults) : list;
  }, [trimmed, sortOrder, data, maxResults]);

  const open = (item) => {
    onSelect?.(item);
    if (item.href?.startsWith("#")) window.location.hash = item.href.slice(1);
  };
  const links = () => [...(listRef.current?.querySelectorAll("a[href]") ?? [])];

  const onInputKey = (event) => {
    if (event.key === "Enter" && results[0] && trimmed) {
      event.preventDefault();
      open(results[0]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      links()[0]?.focus();
    }
  };
  const onListKey = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const all = links();
    const i = all.indexOf(document.activeElement);
    if (i === -1) return;
    event.preventDefault();
    if (event.key === "ArrowDown") all[Math.min(i + 1, all.length - 1)]?.focus();
    else if (i === 0) inputRef.current?.focus();
    else all[i - 1]?.focus();
  };

  const showIdle = idleContent && !trimmed;

  return (
    <div className={cn("flex w-full flex-col space-y-4", className)}>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder={placeholder}
            aria-label="Search"
            className="w-full pr-10"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKey}
            value={query}
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} aria-hidden="true" />
        </div>

        {showSort && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                {sortOrder === "asc" ? <ArrowUpAZ className="mr-2 h-4 w-4" /> : <ArrowDownAZ className="mr-2 h-4 w-4" />}
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>Title (A–Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>Title (Z–A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("")}>Default order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {trimmed ? `${results.length} ${results.length === 1 ? "result" : "results"}` : ""}
      </p>

      {showIdle ? (
        idleContent
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {emptyMessage ? emptyMessage(trimmed) : `No results for “${trimmed}”.`}
        </div>
      ) : (
        <ul ref={listRef} onKeyDown={onListKey} className={cn("m-0 w-full list-none space-y-2 overflow-y-auto p-0", listClassName)}>
          {results.map((item) => (
            <li key={item.id} className="relative flex gap-4 rounded-lg border bg-card p-3 text-card-foreground transition-colors focus-within:border-primary hover:border-primary/60">
              {item.image && (
                <img src={item.image} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-md bg-background object-contain" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-medium leading-snug">
                    {item.href ? (
                      <a href={item.href} onClick={() => onSelect?.(item)} className="after:absolute after:inset-0 hover:text-primary focus-visible:text-primary">
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {item.meta && <span className="shrink-0 text-sm tabular-nums">{item.meta}</span>}
                </div>
                {item.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{item.description}</p>}
                {item.tags?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { SearchComponent };
export default SearchComponent;
