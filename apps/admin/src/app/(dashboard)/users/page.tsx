import { User, columns } from "./columns";
import { DataTable } from "./data-table";
import { cookies } from "next/headers";

const getData = async (): Promise<User[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/users`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch users, status:", res.status);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const UsersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
