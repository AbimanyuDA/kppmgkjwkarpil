"use client";
import { useState } from "react";
import DashboardPage from "../dashboard/page";
import ReportsPage from "../dashboard/reports/page";

export default function PengurusLayout({}: { children: React.ReactNode }) {
  const [active, setActive] = useState<"dashboard" | "laporan">("dashboard");
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Bar without sidebar/toggle */}
      <header className="bg-white border-b px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-900">GKJW Finance</p>
          <h1 className="text-xl font-bold text-blue-900">Sistem Keuangan GKJW Karangpilang</h1>
        </div>
        <div className="text-right leading-tight">
          <span className="font-bold text-blue-900 text-lg block">Pengurus</span>
          <span className="text-xs text-blue-700 block">View</span>
        </div>
      </header>

      {/* Tabs for Dashboard / Laporan */}
      <div className="bg-white border-b px-6 sm:px-8 py-3 flex gap-2">
        <button
          type="button"
          onClick={() => setActive("dashboard")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            active === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActive("laporan")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            active === "laporan" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Laporan
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 sm:p-8">
        {active === "dashboard" && <DashboardPage />}
        {active === "laporan" && <ReportsPage />}
      </main>
    </div>
  );
}
