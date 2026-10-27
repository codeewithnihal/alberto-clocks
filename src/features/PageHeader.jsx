/** Page title block used by every inner page. */
export default function PageHeader({ title, intro, children, id = "page-title" }) {
  return (
    <header className="page-header">
      <h1 id={id} className="t-h1">
        {title}
      </h1>
      {intro && <p className="page-header__intro">{intro}</p>}
      {children}
    </header>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>
            {item.to ? <a href={`#${item.to}`}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
            {i < items.length - 1 && <span aria-hidden="true"> / </span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
