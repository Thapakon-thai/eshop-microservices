"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { Order } from "@/app/(dashboard)/orders/columns";

const chartConfig = {
  successful: {
    label: "Completed Orders",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending Orders",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const AppAreaChart = ({ data = [] }: { data: Order[] }) => {
  // Aggregate real orders by their created_at month
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Create an array mapping each month to order counts
  const chartDataMap = months.reduce(
    (acc, month) => {
      acc[month] = { month, successful: 0, pending: 0 };
      return acc;
    },
    {} as Record<
      string,
      { month: string; successful: number; pending: number }
    >,
  );

  // For orders without dates, spread them out similarly or group under month 0.
  // We'll parse the date here.
  (data ?? []).forEach((order) => {
    let monthIndex = new Date().getMonth(); // default to current month
    if (order.created_at) {
      const d = new Date(order.created_at);
      if (!isNaN(d.getTime())) {
        monthIndex = d.getMonth();
      }
    }
    const monthStr = months[monthIndex];
    if (order.status === "success" || order.status === "paid") {
      chartDataMap[monthStr].successful += 1;
    } else {
      chartDataMap[monthStr].pending += 1;
    }
  });

  // Since not all 12 months might have data, we just take the last 6 months based on current month
  const currentMonthIndex = new Date().getMonth();
  const displayData = [];
  for (let i = 5; i >= 0; i--) {
    let mIndex = currentMonthIndex - i;
    if (mIndex < 0) mIndex += 12;
    displayData.push(chartDataMap[months[mIndex]]);
  }

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Order Volume</h1>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <AreaChart accessibilityLayer data={displayData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-successful)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-successful)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-pending)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-pending)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="pending"
            type="natural"
            fill="url(#fillMobile)"
            fillOpacity={0.4}
            stroke="var(--color-pending)"
            stackId="a"
          />
          <Area
            dataKey="successful"
            type="natural"
            fill="url(#fillDesktop)"
            fillOpacity={0.4}
            stroke="var(--color-successful)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default AppAreaChart;
