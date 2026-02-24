"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const ProductCard = ({ product }: { product: ProductType }) => {
  const [productTypes, setProductTypes] = useState({
    size: product.sizes?.[0] || "",
    color: product.colors?.[0] || "",
  });

  const { addToCart } = useCartStore();

  const handleProductType = ({
    type,
    value,
  }: {
    type: "size" | "color";
    value: string;
  }) => {
    setProductTypes((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: productTypes.size,
      selectedColor: productTypes.color,
    });
    toast.success("Product added to cart");
  };

  const displayImage =
    (product.images &&
      productTypes.color &&
      product.images[productTypes.color]) ||
    "/logo.png";

  return (
    <div className="group bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 hover:-translate-y-1">
      {/* IMAGE */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[2/3]">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      {/* PRODUCT DETAIL */}
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-semibold text-lg line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {product.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>
        {/* PRODUCT TYPES */}
        <div className="flex items-center gap-4 text-xs">
          {/* SIZES */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Size</span>
            <select
              name="size"
              id="size"
              className="ring ring-gray-300 rounded-md px-2 py-1"
              onChange={(e) =>
                handleProductType({ type: "size", value: e.target.value })
              }
            >
              {(product.sizes || []).map((size) => (
                <option key={size} value={size}>
                  {size.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {/* COLORS */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Color</span>
            <div className="flex items-center gap-2">
              {(product.colors || []).map((color) => (
                <div
                  className={`cursor-pointer border-1 ${
                    productTypes.color === color
                      ? "border-gray-400"
                      : "border-gray-200"
                  } rounded-full p-[1.2px]`}
                  key={color}
                  onClick={() =>
                    handleProductType({ type: "color", value: color })
                  }
                >
                  <div
                    className="w-[14px] h-[14px] rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* PRICE AND ADD TO CART BUTTON */}
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-lg dark:text-white">
            ${product.price.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            className="rounded-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white transition-colors duration-300 flex items-center gap-2 shadow-md hover:shadow-violet-500/30"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
