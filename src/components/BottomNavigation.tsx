import React from "react";
import { Home, Compass, Heart, ShoppingBag, User, Sliders } from "lucide-react";

interface BottomNavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  cartCount: number;
  wishlistCount: number;
  isAdminOpen?: boolean;
  onToggleAdmin?: () => void;
}

export default function BottomNavigation({
  currentPage,
  setCurrentPage,
  cartCount,
  wishlistCount,
  isAdminOpen = false,
  onToggleAdmin
}: BottomNavigationProps) {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "collections", label: "Collections", icon: Compass },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { id: "cart", label: "Cart", icon: ShoppingBag, count: cartCount },
    { id: "account", label: "Account", icon: User },
    { id: "admin", label: "Admin", icon: Sliders }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg bg-white/60 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.1)] rounded-full px-6 py-2.5 flex justify-between items-center transition-all duration-300 select-none">
      {items.map((item) => {
        const IconComponent = item.icon;
        const isActive = item.id === "admin" ? isAdminOpen : (currentPage === item.id && !isAdminOpen);
        return (
          <button
            key={item.id}
            id={`nav-item-${item.id}`}
            onClick={() => {
              if (item.id === "admin") {
                if (onToggleAdmin) onToggleAdmin();
              } else {
                setCurrentPage(item.id);
                if (isAdminOpen && onToggleAdmin) {
                  onToggleAdmin();
                }
              }
            }}
            className="flex flex-col items-center justify-center relative p-1.5 rounded-full transition-all duration-200 hover:scale-110 group cursor-pointer"
          >
            <div className={`p-1.5 rounded-full transition-all ${isActive ? "bg-[#C5A059] text-white" : "text-gray-500 hover:text-black"}`}>
              <IconComponent className="w-4.5 h-4.5" />
            </div>
            
            <span className={`text-[9px] font-sans uppercase tracking-widest mt-0.5 scale-0 group-hover:scale-100 md:scale-100 transition-all ${isActive ? "text-[#C5A059] font-semibold" : "text-gray-400"}`}>
              {item.label}
            </span>

            {item.count !== undefined && item.count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C5A059] text-white text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center font-bold border border-white">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
