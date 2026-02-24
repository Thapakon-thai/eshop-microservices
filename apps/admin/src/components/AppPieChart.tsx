"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { TrendingUp } from "lucide-react";

import type { Product } from "@/app/(dashboard)/products/columns";

const chartConfig = {
  inventory: {
    label: "Products",
  },
  "t-shirts": { label: "T-Shirts", color: "var(--chart-1)" },
  accessories: { label: "Accessories", color: "var(--chart-2)" },
  shoes: { label: "Shoes", color: "var(--chart-3)" },
  bags: { label: "Bags", color: "var(--chart-4)" },
  jackets: { label: "Jackets", color: "var(--chart-5)" },
  other: { label: "Other", color: "var(--sidebar-primary)" },
} satisfies ChartConfig;

const AppPieChart = ({ data }: { data: Product[] }) => {
  // Categorize products. Assuming name or description contains category hints for demo,
  // since the Product type doesn't have an explicit 'category' string in this mock schema.
  const categories: Record<string, number> = {
    "t-shirts": 0,
    accessories: 0,
    shoes: 0,
    bags: 0,
    jackets: 0,
    other: 0,
  };

  data.forEach((product) => {
    const name = product.name.toLowerCase();
    if (name.includes("t-shirt") || name.includes("shirt"))
      categories["t-shirts"]++;
    else if (name.includes("shoe") || name.includes("sneaker"))
      categories["shoes"]++;
    else if (name.includes("bag")) categories["bags"]++;
    else if (name.includes("jacket")) categories["jackets"]++;
    else if (name.includes("glass") || name.includes("hat"))
      categories["accessories"]++;
    else categories["other"]++;
  });

  const chartData = Object.entries(categories)
    .filter(([_, count]) => count > 0)
    .map(([category, visitors]) => ({
      browser: category,
      visitors,
      fill: `var(--color-${category})`,
    }));

  // If no data, provide a safe fallback so the chart doesn't crash
  if (chartData.length === 0) {
    chartData.push({
      browser: "other",
      visitors: 1,
      fill: "var(--color-other)",
    });
  }

  // If you don't use React compiler use useMemo hook to improve performance
  const totalVisitors = chartData.reduce((acc, curr) => acc + curr.visitors, 0);

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Products by Category</h1>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="browser"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Products
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-4 flex flex-col gap-2 items-center text-center">
        <div className="flex items-center gap-2 font-medium leading-none">
          Live Inventory Distribution{" "}
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground text-sm max-w-[250px]">
          Showing category breakdown of {totalVisitors} available products in
          the shop.
        </div>
      </div>
    </div>
  );
};

export default AppPieChart;
