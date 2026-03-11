import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, ClipboardList, User, LogIn } from "lucide-react";

const BottomNav = ({ isLoggedIn = false }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    {
      label: "Home",
      icon: Home,
      href: "/restaurants",
      isActive: (p) => p === "/" || p === "/restaurants",
      show: true,
    },
    {
      label: "Search",
      icon: Search,
      href: "/restaurants",
      isActive: (p) => p.startsWith("/restaurants/"),
      show: true,
    },
    {
      label: "My Orders",
      icon: ClipboardList,
      href: "/my-orders",
      isActive: (p) => p.startsWith("/my-orders") || p.startsWith("/order-status"),
      // Only visible to logged-in users
      show: isLoggedIn,
    },
    {
      label: isLoggedIn ? "Profile" : "Login",
      icon: isLoggedIn ? User : LogIn,
      href: isLoggedIn ? "/profile" : "/login",
      isActive: (p) => p.startsWith("/profile") || p === "/login",
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Bottom navigation"
    >
      {/* Glassmorphism shell */}
      <div
        className="bg-white/75 backdrop-blur-xl border-t border-gray-200/60"
        style={{
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.07), 0 -1px 0 rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex justify-around items-stretch px-2 py-1.5">
          {NAV_ITEMS.map(({ label, icon: Icon, href, isActive }) => {
            const active = isActive(pathname);
            return (
              <button
                key={label}
                onClick={() => navigate(href)}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 px-1 rounded-2xl cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors duration-150"
              >
                {/* Active pill indicator */}
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: active ? "2rem" : "0", opacity: active ? 1 : 0 }}
                />

                {/* Icon bubble */}
                <span
                  className="flex items-center justify-center w-10 h-9 rounded-xl transition-all duration-200 ease-out"
                  style={{
                    background: active ? "rgb(239 246 255)" : "transparent",
                    transform: active ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.75}
                    style={{
                      color: active ? "var(--color-primary, #2563eb)" : "#9ca3af",
                      transition: "color 0.2s, stroke-width 0.2s",
                    }}
                  />
                </span>

                {/* Label */}
                <span
                  className="text-[10px] font-semibold leading-none tracking-wide transition-colors duration-200"
                  style={{ color: active ? "var(--color-primary, #2563eb)" : "#9ca3af" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
