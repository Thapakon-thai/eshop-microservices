import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

import type { Payment } from "@/app/(dashboard)/payments/columns";
import type { Product } from "@/app/(dashboard)/products/columns";

const CardList = ({ title, data }: { title: string; data: any[] }) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "Popular Products" && data.length > 0 ? (
          (data as Product[]).slice(0, 5).map((item) => (
            <Card
              key={item.id}
              className="flex-row items-center justify-between gap-4 p-4"
            >
              <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                <Image
                  src={
                    (item.images && Object.values(item.images)[0]) ||
                    "/logo.svg"
                  }
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="flex-1 p-0">
                <CardTitle className="text-sm font-medium">
                  {item.name}
                </CardTitle>
              </CardContent>
              <CardFooter className="p-0 font-medium">
                ${item.price?.toFixed(2)}
              </CardFooter>
            </Card>
          ))
        ) : title === "Latest Transactions" && data.length > 0 ? (
          (data as Payment[]).slice(0, 5).map((item) => (
            <Card
              key={item.id}
              className="flex-row items-center justify-between gap-4 p-4"
            >
              <div className="w-12 h-12 rounded-full relative overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
                {item.fullName ? item.fullName.slice(0, 2) : "U"}
              </div>
              <CardContent className="flex-1 p-0">
                <CardTitle className="text-sm font-medium">
                  Payment from {item.fullName || "User"}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={
                    item.status === "success"
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                  }
                >
                  {item.status}
                </Badge>
              </CardContent>
              <CardFooter className="p-0 font-medium text-green-500 dark:text-green-400">
                +${item.amount?.toFixed(2)}
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No data available.</p>
        )}
      </div>
    </div>
  );
};

export default CardList;
