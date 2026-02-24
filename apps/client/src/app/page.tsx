import ProductList from "@/components/ProductList";
import HeroBanner from "@/components/HeroBanner";
import { redirect } from "next/navigation";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;
  if (!category) {
    redirect("/?category=all");
  }
  let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/products?limit=4`;
  if (category && category !== "all") {
    url += `&category=${category}`;
  }
  const response = await fetch(url, {
    cache: "no-store",
  });
  const data = await response.json();
  const products = data.products || [];

  return (
    <div className="">
      <HeroBanner />
      <ProductList category={category} params="homepage" products={products} />
    </div>
  );
};

export default Homepage;
