"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import { FiBox, FiGrid, FiImage, FiUsers, FiMessageSquare } from 'react-icons/fi';

function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    galleries: 0,
    users: 0,
    feedbacks: 0,
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      const headers = {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json'
      };

      const fetchData = async () => {
        try {
          const [products, categories, galleries, users, feedbacks] = await Promise.all([
            axios.get("http://localhost:5000/api/products", { headers }),
            axios.get("http://localhost:5000/api/categories", { headers }),
            axios.get("http://localhost:5000/api/galleries", { headers }),
            axios.get("http://localhost:5000/api/users", { headers }),
            axios.get("http://localhost:5000/api/feedbacks", { headers })
          ]);

          setStats({
            products: products.data.length,
            categories: categories.data.length,
            galleries: galleries.data.length,
            users: users.data.length,
            feedbacks: feedbacks.data.length,
          });
        } catch (error) {
          console.error("Error fetching statistics:", error.response || error);
        }
      };

      fetchData();
    }
  }, [session, status]);

  const statCards = [
    { title: 'Products', value: stats.products, icon: <FiBox className="w-8 h-8" />, color: 'bg-blue-500' },
    { title: 'Categories', value: stats.categories, icon: <FiGrid className="w-8 h-8" />, color: 'bg-green-500' },
    { title: 'Gallery Images', value: stats.galleries, icon: <FiImage className="w-8 h-8" />, color: 'bg-purple-500' },
    { title: 'Users', value: stats.users, icon: <FiUsers className="w-8 h-8" />, color: 'bg-orange-500' },
    { title: 'Feedbacks', value: stats.feedbacks, icon: <FiMessageSquare className="w-8 h-8" />, color: 'bg-red-500' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className={`${card.color} p-4 flex items-center justify-center text-white`}>
                {card.icon}
              </div>
              <div className="p-4">
                <h2 className="text-gray-600 text-sm font-semibold">{card.title}</h2>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">{card.value}</span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-gray-600 font-medium mb-2">Most Active Section</h3>
              <p className="text-gray-800">Products ({stats.products} items)</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-gray-600 font-medium mb-2">User Engagement</h3>
              <p className="text-gray-800">{stats.feedbacks} feedback submissions</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
