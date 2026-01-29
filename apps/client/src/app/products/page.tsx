import ProductList from "@/components/ProductList";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;
  
  let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/products?limit=20`;
  if (category) {
    url += `&category=${category}`;
  }

  const response = await fetch(url, {
    cache: "no-store",
  });
  const data = await response.json();
  const products = data.products || [];

  return (
    <div className="">
      <ProductList category={category} params="products" products={products}/>
    </div>
  );
};

export default ProductsPage;
