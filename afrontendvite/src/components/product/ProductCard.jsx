import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className=" border border-gray-200 rounded p-4 flex flex-col items-center hover:shadow-lg transition-shadow bg-white h-full cursor-pointer text-inherit no-underline"
    >
      <img
        src={product.img_500x500 || product.img_high}
        alt={product.title}
        className="h-40 w-full object-contain mb-4"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23eeeeee%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
        }}
      />
      <h3
        className="text-sm font-semibold text-center mb-1 line-clamp-2 h-10"
        dangerouslySetInnerHTML={{ __html: product.title }}
      />
      <p className="text-gray-500 text-sm mb-4">
        ${product.price ? product.price / 100 : "N/A"} | {product.supplier}
      </p>

      <div className="mt-auto w-full flex items-center justify-center gap-2 border-t pt-3">
        <button
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"
        >
          <span>Add to</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-500">rank: {product.id}</span>
      </div>
    </Link>
  );
}
