import { Tag, Watch } from "lucide-react";
import AnimatedCategoryCard from "../components/CategoriesCards";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice, plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

export default function CollectionsPage() {
  useDocumentTitle("Collections");
  return (
    <CatalogGate>
      {(data) => (
        <div className="page">
          <PageHeader
            title="Collections"
            intro="Six distinct expressions of time. Choose a collection to explore its twelve thoughtfully selected timepieces."
          >
            <InteractiveHoverButton text="View all watches" href="#/collections/all" className="w-56" />
          </PageHeader>
          <ul className="category-grid">
            {data.categories.map((category) => {
              const list = data.productsByCategory.get(category.id);
              const from = Math.min(...list.map((p) => p.price));
              return (
                <li key={category.id}>
                  <AnimatedCategoryCard
                    title={category.name}
                    href={`#/collections/${category.id}`}
                    images={list.slice(0, 3).map((p) => p.imageUrl)}
                    description={category.description}
                    className="max-w-none"
                    stats={[
                      { icon: <Watch className="h-4 w-4" aria-hidden="true" />, label: plural(list.length, "watch", "watches") },
                      { icon: <Tag className="h-4 w-4" aria-hidden="true" />, label: `From ${formatPrice(from, data.currency)}` },
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
