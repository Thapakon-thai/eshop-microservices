
import { Order, columns } from "./columns";
import { DataTable } from "../users/data-table"; // Reuse Datatable from users or shared component

const getData = async (): Promise<Order[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/order/orders`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
};

const OrdersPage = async () => {
  let data: Order[] = [];
  try {
      data = await getData();
  } catch (error) {
      console.error(error);
  }

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Orders</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default OrdersPage;
