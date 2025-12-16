import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useRouteProtection() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    
    // Guest role - hanya bisa akses dashboard dan reports
    if (user.role === "guest") {
      const allowedPaths = ["/dashboard", "/dashboard/reports"];
      const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
      
      if (!isAllowed) {
        setIsAuthorized(false);
        router.push("/dashboard");
        return;
      }
    }

    setIsAuthorized(true);
  }, [pathname, router]);

  return isAuthorized;
}
