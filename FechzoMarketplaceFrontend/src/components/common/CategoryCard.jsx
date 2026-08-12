import { Link } from "react-router-dom";

export default function CategoryCard({
  name,
  slug,
  image
}) {
  return (
    <Link
      to={`/${slug}`}
      className="category-card"
    >
      {image && (
        <img
          src={image}
          alt={name}
        />
      )}

      <h3>{name}</h3>
    </Link>
  );
}