import { useStore } from "../../store/useStore";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const products = useStore((state) => state.products);
  const isLoading = useStore((state) => state.isLoading);

  if (products.length === 0) {
    return <div className="p-6 text-gray-500">No products found.</div>;
  }

  if (isLoading) {
    return (
      <div className="text-center py-10 w-full text-gray-500">
        Loading products...
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-10 w-full text-gray-500">
        No results found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
