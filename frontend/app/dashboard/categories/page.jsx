"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const { data: session, status } = useSession();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      fetchCategories();
    }
  }, [session, status]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
      });
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.warning("Category name is required!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/categories/add", newCategory, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
      });
      fetchCategories();
      setNewCategory({ name: "", description: "" });
      setError("");
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/soft-delete/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`
          },
        });
        fetchCategories();
        toast.success("Category deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  if (status === 'loading') {
    return <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </DashboardLayout>;
  }

  if (status === 'unauthenticated') {
    return <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Please sign in to access this page.
        </div>
      </div>
    </DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories Management</h1>
          
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Enter description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
            </div>
            <button 
              onClick={handleAddCategory}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{category.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Categories;
  