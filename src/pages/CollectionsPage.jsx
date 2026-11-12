import { Clock, Tag, Watch } from "lucide-react";
import AnimatedCategoryCard from "../components/CategoriesCards";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice, plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

export default function CollectionsPage() {
  useDocumentTitle(
    "Collections",
    "Explore our watch collections and dedicated clock range.",
  );
  return (
    <CatalogGate>
      {(data) => (
        <div className="page">
          <div className="mb-10">
            <PageHeader
              title="Collections"
              intro="Explore our curated watch lines alongside our dedicated collection of interior clocks."
            >
              <div className="pt-2">
                <InteractiveHoverButton
                  text="View all timepieces"
                  href="/collections/all"
                  className="w-56"
                />
              </div>
            </PageHeader>
          </div>
          <ul className="collections-layout">
            {data.categories.map((category, index) => {
              const list = data.productsByCategory.get(category.id) ?? [];
              const from = list.length ? Math.min(...list.map((p) => p.price)) : 0;
              const fromCurrency =
                list.find((p) => p.price === from)?.currency ?? data.currency;
              const isClock = category.id === "clocks" || category.productType === "clock";
              return (
                <li
                  key={category.id}
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 80}
                >
                  <AnimatedCategoryCard
                    title={category.name}
                    href={`/collections/${category.id}`}
                    images={list.slice(0, 3).map((p) => p.imageUrl)}
                    description={category.description}
                    className="max-w-none"
                    stats={[
                      {
                        icon: isClock ? (
                          <Clock className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Watch className="h-4 w-4" aria-hidden="true" />
                        ),
                        label: isClock
                          ? plural(list.length, "clock", "clocks")
                          : plural(list.length, "watch", "watches"),
                      },
                      {
                        icon: <Tag className="h-4 w-4" aria-hidden="true" />,
                        label: `From ${formatPrice(from, fromCurrency)}`,
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </CatalogGate>
  );
}

