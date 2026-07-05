import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/chorus-logo.png";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch directly using the document ID route
    fetch(`http://localhost:9200/ecommerce/_doc/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("elastic:ElasticRocks"),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data.found) {
          setProduct({ id: data._id, ...data._source });
        } else {
          setError("Product not found.");
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!product) return <div className="p-8">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900 font-sans overflow-y-auto">
      <header className="flex items-start p-6 border-b border-gray-200">
        <div
          className="w-72 flex-shrink-0 flex justify-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Chorus" className="h-16 w-auto object-contain" />
        </div>
      </header>

      <main className="p-10 max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 flex justify-center items-start border border-gray-200 p-4 rounded bg-white">
          <img
            src={product.img_high || product.img_500x500}
            alt={product.title}
            className="max-w-full h-auto object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline w-fit mb-2 font-semibold"
          >
            &larr; Back to Results
          </button>

          <h1
            className="text-3xl font-bold text-gray-800"
            dangerouslySetInnerHTML={{ __html: product.title }}
          />
          <p className="text-sm text-gray-500">
            Supplier: {product.supplier} | EAN: {product.ean?.[0]}
          </p>

          <div className="text-2xl font-bold text-gray-900 mt-2">
            ${product.price ? product.price / 100 : "N/A"}
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-100 mt-4">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.short_description || "No description available."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
