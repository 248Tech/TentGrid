"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  session: Session;
  onMenuClick: () => void;
}

export function TopBar({ session, onMenuClick }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-white">
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 transition-colors"
        >
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {session.user?.name ?? session.user?.email ?? "User"}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white shadow-md z-50">
            <div className="px-3 py-2 border-b">
              <p className="text-xs font-medium text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
