"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-1/6 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li className={pathname === "/" ? "font-bold" : ""}>
            <Link href="/" className="block p-2 rounded hover:bg-gray-300">All Recipes</Link>
          </li>
          <li className={pathname === "/myrecipes" ? "font-bold" : ""}>
            <Link href="/myrecipes" className="block p-2 rounded hover:bg-gray-300">My Recipes</Link>
          </li>
          <li className={pathname === "/accounts" ? "font-bold" : ""}>
            <Link href="/accounts" className="block p-2 rounded hover:bg-gray-300">Accounts</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;