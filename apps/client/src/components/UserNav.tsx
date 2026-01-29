"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { LogOut, User, Settings, Package } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import useCartStore from "@/stores/cartStore"

export function UserNav() {
  const router = useRouter()
  const { isAuthenticated, logout, checkAuth } = useAuthStore()
  const { fetchCart, clearCart } = useCartStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    checkAuth() // Ensure sync with cookie on mount
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated) {
        fetchCart()
    } else {
        // Optional: clear cart on logout so next user doesn't see it
        // Or keep it if we want guest persistence. 
        // User requested "badge show same number for all users" => imply we should clear it or user separation.
        // Clearing it is safest to avoid leaking data.
        clearCart()
    }
  }, [isAuthenticated, fetchCart, clearCart])

  const handleLogout = () => {
    logout()
    clearCart() 
    router.push("/")
    router.refresh()
  }

  if (!isMounted) {
    return null // or a loading skeleton
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/signin" className="text-sm font-medium hover:underline">
        Sign in
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {useAuthStore.getState().user?.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {useAuthStore.getState().user?.email || 'user@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders" className="flex items-center w-full">
              <Package className="mr-2 h-4 w-4" />
              <span>Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
