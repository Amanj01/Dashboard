import { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenuAlt2, HiX } from "react-icons/hi";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsOpen(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX size={24} /> : <HiMenuAlt2 size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static h-screen bg-gray-800 text-white transition-all duration-300 ease-in-out shadow-xl
          ${isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="text-center text-2xl font-bold p-6 border-b border-gray-700">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Admin Panel 
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-grow py-4 overflow-y-auto">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/products", label: "Products" },
              { href: "/dashboard/categories", label: "Categories" },
              { href: "/dashboard/gallery", label: "Gallery" },
              { href: "/dashboard/feedback", label: "Feedback" },
              { href: "/dashboard/users", label: "Users" },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center px-6 py-3 hover:bg-gray-700 transition-colors duration-200"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 text-center">
              © 2024 Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
