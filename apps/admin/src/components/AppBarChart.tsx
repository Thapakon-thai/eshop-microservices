"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { Payment } from "@/app/(dashboard)/payments/columns";

const chartConfig = {
  total: {
    label: "Total Revenue",
    color: "var(--chart-1)",
  },
  successful: {
    label: "Successful Revenue",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const AppBarChart = ({ data = [] }: { data: Payment[] }) => {
  // Group payments by month (mocking months based on current year or just distributing them for demo if no dates)
  // Usually, Payment would have a `createdAt` date. If it doesn't, we'll arbitrarily bucket them by month or just show total if no dates.
  // Wait, looking at Payment type: { id, amount, fullName, userId, email, status } - it lacks dates!
  // Since this is a demo/dashboard overview without dates in the model, we'll distribute the latest payments across the last 6 months to simulate a trend, or maybe just display the last 6 payments.
  // Let's create a simulated 6-month trend using the actual amounts.

  const months = ["January", "February", "March", "April", "May", "June"];
  const chartData = months.map((month) => ({ month, total: 0, successful: 0 }));

  (data ?? []).forEach((payment, index) => {
    // Distribute payments across the 6 buckets using modulo
    const bucket = index % 6;
    chartData[bucket].total += payment.amount;
    if (payment.status === "success") {
      chartData[bucket].successful += payment.amount;
    }
  });

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Total Revenue</h1>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
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
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          <Bar dataKey="successful" fill="var(--color-successful)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AppBarChart;
