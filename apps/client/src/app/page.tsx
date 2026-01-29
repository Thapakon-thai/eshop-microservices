import ProductList from "@/components/ProductList";
import HeroBanner from "@/components/HeroBanner";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/products?limit=4`, {
    cache: "no-store",
  });
  const data = await response.json();
  const products = data.products || [];

  return (
    <div className="">
      <HeroBanner />
      <ProductList category={category} params="homepage" products={products}/>
    </div>
  );
};

export default Homepage;
