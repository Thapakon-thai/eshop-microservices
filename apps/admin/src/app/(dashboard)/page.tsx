import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import { cookies } from "next/headers";

const Homepage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const fetchOptions = {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  } as RequestInit;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  let payments = [];
  let products = [];
  let orders = [];

  try {
    const [paymentsRes, productsRes, ordersRes] = await Promise.all([
      fetch(`${apiUrl}/payment/payments`, fetchOptions),
      fetch(`${apiUrl}/products?limit=20`, { cache: "no-store" }), // public route
      fetch(`${apiUrl}/order/orders`, fetchOptions),
    ]);

    if (paymentsRes.ok) payments = await paymentsRes.json();
    if (productsRes.ok) {
      const pData = await productsRes.json();
      products = pData.products || [];
    }
    if (ordersRes.ok) orders = await ordersRes.json();
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 p-4">
      {/* Row 1 */}
      <div className="bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 lg:col-span-2 2xl:col-span-2">
        <AppBarChart data={payments} />
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 lg:col-span-2 2xl:col-span-1 flex justify-center items-center">
        <AppPieChart data={products} />
      </div>

      {/* Row 2 */}
      <div className="bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 lg:col-span-2 2xl:col-span-2 flex justify-center items-center">
        <AppAreaChart data={orders} />
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 lg:col-span-2 2xl:col-span-1">
        <CardList title="Latest Transactions" data={payments} />
      </div>

      {/* Row 3 */}
      <div className="bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 lg:col-span-2 2xl:col-span-3">
        <CardList title="Popular Products" data={products} />
      </div>
    </div>
  );
};

export default Homepage;
