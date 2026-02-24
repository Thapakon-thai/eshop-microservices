import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import { cookies } from "next/headers";
import { DollarSign, ShoppingCart, Package, CreditCard } from "lucide-react";

const Homepage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const fetchOptions = {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  } as RequestInit;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  let payments: any[] = [];
  let products: any[] = [];
  let orders: any[] = [];

  try {
    const [paymentsRes, productsRes, ordersRes] = await Promise.all([
      fetch(`${apiUrl}/payment/payments`, fetchOptions),
      fetch(`${apiUrl}/products?limit=20`, { cache: "no-store" }), // public route
      fetch(`${apiUrl}/order/orders`, fetchOptions),
    ]);

    if (paymentsRes.ok) payments = (await paymentsRes.json()) ?? [];
    if (productsRes.ok) {
      const pData = await productsRes.json();
      products = pData.products || [];
    }
    if (ordersRes.ok) orders = (await ordersRes.json()) ?? [];
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
  }

  // Compute summary stats
  const totalRevenue = (payments ?? []).reduce(
    (sum: number, p: any) => sum + (p.amount || 0),
    0,
  );
  const successfulPayments = (payments ?? []).filter(
    (p: any) => p.status === "success",
  ).length;
  const totalOrders = (orders ?? []).length;
  const totalProducts = (products ?? []).length;

  const cardClass =
    "bg-card text-card-foreground p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1";

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Row 1: Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 rounded-2xl bg-green-500/10">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <ShoppingCart className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 rounded-2xl bg-purple-500/10">
            <Package className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Products</p>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="p-3 rounded-2xl bg-orange-500/10">
            <CreditCard className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payments</p>
            <p className="text-2xl font-bold">
              {successfulPayments}/{(payments ?? []).length}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Revenue Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-2`}>
          <AppBarChart data={payments} />
        </div>
        <div
          className={`${cardClass} flex flex-col items-center justify-center`}
        >
          <AppPieChart data={products} />
        </div>
      </div>

      {/* Row 3: Order Volume + Latest Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardClass} lg:col-span-2`}>
          <AppAreaChart data={orders} />
        </div>
        <div className={cardClass}>
          <CardList title="Latest Transactions" data={payments ?? []} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
