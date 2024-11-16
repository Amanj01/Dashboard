"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from "../components/DashboardLayout";
import { FiBox, FiGrid, FiImage, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    galleries: 0,
    users: 0,
    feedbacks: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const router = useRouter();

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

          // Process category data for the bar chart
          const categoryCounts = {};
          products.data.forEach(product => {
            const catName = product.category?.name || 'Uncategorized';
            categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
          });
          
          const processedCategoryData = Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count
          }));
          
          setCategoryData(processedCategoryData);
        } catch (error) {
          console.error("Error fetching statistics:", error.response || error);
          router.push('/auth/signin');
        }
      };

      fetchData();
    }
  }, [session, status, router]);

  const statCards = [
    { title: 'Products', value: stats.products, icon: <FiBox className="w-8 h-8" />, color: 'bg-blue-500' },
    { title: 'Categories', value: stats.categories, icon: <FiGrid className="w-8 h-8" />, color: 'bg-green-500' },
    { title: 'Gallery Images', value: stats.galleries, icon: <FiImage className="w-8 h-8" />, color: 'bg-purple-500' },
    { title: 'Users', value: stats.users, icon: <FiUsers className="w-8 h-8" />, color: 'bg-orange-500' },
    { title: 'Feedbacks', value: stats.feedbacks, icon: <FiMessageSquare className="w-8 h-8" />, color: 'bg-red-500' },
  ];

  const pieChartData = statCards.map(card => ({
    name: card.title,
    value: card.value
  }));

  const COLORS = ['#3B82F6', '#22C55E', '#A855F7', '#F97316', '#EF4444'];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto h-max">
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



        {/* New Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products per Category Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-h-[400px]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Products per Category</h2>
            <div className="h-[400px]"> {/* Increase height for better visibility */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }} // Add margin for labels
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} // Increase height for labels
                    interval={0} // Show all labels
                    tick={{ fontSize: 12 }} // Adjust font size if needed
                  />
                  <YAxis
                   allowDecimals={false}
                    />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-h-[400px]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;