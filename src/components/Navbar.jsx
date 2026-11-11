import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { cn } from "../lib/utils";

/**
 * Menu item shape:
 *  { id, title, url, active?: boolean, dropdown?: boolean, items?: MenuItem[] }
 *
 * `url` is used as the link target as-is (e.g. "#/collections" for the hash router, or "/about").
 */
export const DEFAULT_MENU = [
  { id: 1, title: "Home", url: "/" },
  {
    id: 2,
    title: "Collections",
    url: "/collections",
    dropdown: true,
    items: [
      { id: 21, title: "Classic", url: "/collections/classic" },
      { id: 22, title: "Sport", url: "/collections/sport" },
    ],
  },
  { id: 3, title: "About", url: "/about" },
  { id: 4, title: "Contact", url: "/contact" },
];

/**
 * Horizontal menu. Hovering or focusing an item changes its colour and slides an
 * underline to it; dropdown panels fade in and out. Items marked `active` keep the
 * accent colour (and aria-current="page") after they are clicked.
 *
 * Props: list, itemClassName (padding / size of each link), className
 */
const Menu = ({ list = DEFAULT_MENU, itemClassName = "px-4 py-2 text-sm", className }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <MotionConfig transition={{ bounce: 0, type: "tween", duration: 0.2 }}>
      <nav className={cn("relative", className)} aria-label="Primary">
        <ul className="flex items-center">
          {list.map((item) => (
            <li
              key={item.id}
              className="relative"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              // Close the dropdown when keyboard focus leaves this menu item.
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setHovered(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setHovered(null);
              }}
            >
              {/* Plain <a>: the original used next/link, which only exists in Next.js. */}
              <a
                className={cn(
                  "relative flex items-center justify-center rounded transition-colors duration-200 hover:text-primary",
                  item.active ? "text-primary" : "text-foreground/80",
                  itemClassName
                )}
                onFocus={() => setHovered(item.id)}
                href={item.url}
                aria-current={item.active ? "page" : undefined}
                aria-haspopup={item.dropdown ? "true" : undefined}
                aria-expanded={item.dropdown ? hovered === item.id : undefined}
              >
                {item.title}
                {(hovered === item.id || item.active) && (
                  <motion.span
                    layoutId={hovered === item.id ? "nav-underline" : `nav-active-${item.id}`}
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-px bg-primary"
                  />
                )}
              </a>

              <AnimatePresence>
                {item.dropdown && hovered === item.id && (
                  <motion.div
                    key="panel"
                    className="absolute left-0 top-full z-50 pt-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                  >
                    <ul className="flex w-60 flex-col rounded-md border bg-popover py-1 text-popover-foreground shadow-lg">
                      {item.items?.map((nav) => (
                        <li key={`link-${nav.id}`}>
                          <a
                            href={nav.url}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {nav.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </nav>
    </MotionConfig>
  );
};

export { Menu as Navbar };
export default Menu;
