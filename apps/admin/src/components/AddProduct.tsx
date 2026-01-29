"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

const categories = [
  "T-shirts",
  "Shoes",
  "Accessories",
  "Bags",
  "Dresses",
  "Jackets",
  "Gloves",
] as const;

const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

const sizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  price: z.coerce.number().min(1, { message: "Price is required!" }),
  category: z.enum(categories),
  stock: z.coerce.number().min(1, { message: "Stock is required!" }),
  sizes: z.array(z.enum(sizes)),
  colors: z.array(z.enum(colors)),
  images: z.record(z.string()),
});

const AddProduct = () => {
  // State to force file input reset after image deletion
  const [fileInputKeys, setFileInputKeys] = useState<Record<string, number>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: {},
      sizes: [],
      colors: [],
      stock: 100
    }
  });

  // Watch images for reactivity
  const watchedImages = useWatch({ control: form.control, name: "images" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
         ...values,
         category_id: values.category.toLowerCase(), // basic mapping
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdProduct = await res.json();
        
        // Auto-sync stock to inventory service
        if (createdProduct.id && values.stock > 0) {
          try {
            const token = document.cookie
              .split('; ')
              .find(row => row.startsWith('access_token='))
              ?.split('=')[1];
            
            if (token) {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/inventory/stock`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                  product_id: createdProduct.id,
                  quantity_change: values.stock,
                }),
              });
            }
          } catch (stockError) {
            console.error("Failed to sync stock:", stockError);
          }
        }
        
        alert("Product created successfully!");
        window.location.reload(); // Simple reload to refresh list
      } else {
        const error = await res.json();
        alert(`Failed to create product: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-4 my-2">
                          {sizes.map((size) => (
                            <FormItem key={size} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(size)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, size])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== size
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {size}
                                </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 my-2">
                            {colors.map((color) => (
                              <FormItem key={color} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(color)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, color])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== color
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color }}
                                  />
                                  {color}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          {/* Image Upload for selected colors */}
                          {field.value && field.value.length > 0 && (
                            <div className="mt-8 space-y-4 border-t pt-4">
                              <p className="text-sm font-medium">Upload images for selected colors:</p>
                              {field.value.map((color) => {
                                const currentImage = watchedImages?.[color] || "";
                                const inputKey = fileInputKeys[color] || 0;
                                return (
                                  <div className="flex flex-col gap-2" key={color}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-sm font-medium capitalize min-w-[60px]">{color}</span>
                                    </div>
                                    {/* Image Preview */}
                                    {currentImage && (
                                      <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                          src={currentImage}
                                          alt={`${color} preview`}
                                          className="w-full h-full object-contain"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentImages = form.getValues("images");
                                            const updated = { ...currentImages };
                                            delete updated[color];
                                            form.setValue("images", updated, { shouldValidate: true });
                                            // Reset file input by changing its key
                                            setFileInputKeys(prev => ({ ...prev, [color]: (prev[color] || 0) + 1 }));
                                          }}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                    {/* File Input or URL Input */}
                                    <div className="flex gap-2">
                                      <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          <span className="text-sm text-gray-600">
                                            {currentImage ? "Change Image" : "Upload Image"}
                                          </span>
                                        </div>
                                        <input
                                          key={`${color}-${inputKey}`}
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                const currentImages = form.getValues("images");
                                                form.setValue("images", {
                                                  ...currentImages,
                                                  [color]: reader.result as string,
                                                }, { shouldValidate: true });
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                    {/* Or paste URL */}
                                    <Input 
                                      className="text-xs"
                                      placeholder="Or paste image URL..."
                                      value={(currentImage && !currentImage.startsWith("data:")) ? currentImage : ""}
                                      onChange={(e) => {
                                        const currentImages = form.getValues("images");
                                        form.setValue("images", {
                                          ...currentImages,
                                          [color]: e.target.value,
                                        }, { shouldValidate: true });
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Create Product</Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
