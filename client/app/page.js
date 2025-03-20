'use client';
// src/App.js
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { AuthProvider } from "./context/AuthContext";
import { useActivePage } from "./hooks/useActivePage";

export default function Home() {
  const { activePage, setActivePage } = useActivePage();
  return (
    <AuthProvider>
    <div className="flex h-full">
      <Sidebar setActivePage={setActivePage} />
      <MainContent activePage={activePage} />
    </div>
  </AuthProvider>
  );
}
