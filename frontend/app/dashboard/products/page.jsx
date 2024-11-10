"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: 0,
    category: "",
  });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [frontThumbnail, setFrontThumbnail] = useState(null);
  const [backThumbnail, setBackThumbnail] = useState(null);

  const notify = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.accessToken) {
      fetchProducts();
      fetchCategories();
    }
  }, [session, status]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });
      setProducts(res.data);
    } catch (error) {
      notify('Error fetching products', 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });
      setCategories(res.data);
    } catch (error) {
      notify('Error fetching categories', 'error');
    }
  };

  const handleAddOrUpdateProduct = async () => {
    if (!newProduct.title.trim() || 
        !newProduct.description.trim() || 
        newProduct.price <= 0 || 
        !newProduct.category.trim()) {
      notify('All fields are required and price must be greater than 0!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append("title", newProduct.title);
    formData.append("shortDescription", newProduct.shortDescription);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("category", newProduct.category);
    if (frontThumbnail) formData.append("frontThumbnail", frontThumbnail);
    if (backThumbnail) formData.append("backThumbnail", backThumbnail);

    try {
      if (selectedProductId) {
        await axios.put(`http://localhost:5000/api/products/update/${selectedProductId}`, formData, {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        notify('Product updated successfully!');
      } else {
        await axios.post("http://localhost:5000/api/products/add", formData, {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        notify('Product added successfully!');
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      notify('Failed to save product', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProductId(product._id);
    setNewProduct({
      title: product.title || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      price: product.price || 0,
      category: product.category._id || "",
    });
    setFrontThumbnail(null);
    setBackThumbnail(null);
  };

  const resetForm = () => {
    setNewProduct({ title: "", shortDescription: "", description: "", price: 0, category: "" });
    setSelectedProductId(null);
    setFrontThumbnail(null);
    setBackThumbnail(null);
    setError("");
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/soft-delete/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });
      notify('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      notify('Failed to delete product', 'error');
    }
  };

  if (status === "loading") {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  if (status === "unauthenticated") {
    return <DashboardLayout>Please sign in to access this page.</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter product title"
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input
                type="text"
                placeholder="Enter short description"
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newProduct.shortDescription}
                onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter full description"
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                min="0"
                placeholder="Enter price"
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value === "" ? "" : parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Front Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFrontThumbnail(e.target.files[0])}
                    className="hidden"
                    id="front-thumbnail"
                  />
                  <label
                    htmlFor="front-thumbnail"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {frontThumbnail ? frontThumbnail.name : 'Choose Front Image'}
                  </label>
                </div>
                {frontThumbnail && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-500 truncate">{frontThumbnail.name}</span>
                    <button
                      onClick={() => setFrontThumbnail(null)}
                      className="ml-2 text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Back Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackThumbnail(e.target.files[0])}
                    className="hidden"
                    id="back-thumbnail"
                  />
                  <label
                    htmlFor="back-thumbnail"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {backThumbnail ? backThumbnail.name : 'Choose Back Image'}
                  </label>
                </div>
                {backThumbnail && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-500 truncate">{backThumbnail.name}</span>
                    <button
                      onClick={() => setBackThumbnail(null)}
                      className="ml-2 text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset
            </button>
            <button
              onClick={handleAddOrUpdateProduct}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {selectedProductId ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{product.title}</td>
                    <td className="px-6 py-4">{product.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category?.name || "No category"}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {product.thumbnails.front && (
                          <img src={`http://localhost:5000/${product.thumbnails.front}`} alt="Front" className="w-16 h-16 object-cover rounded-md" />
                        )}
                        {product.thumbnails.back && (
                          <img src={`http://localhost:5000/${product.thumbnails.back}`} alt="Back" className="w-16 h-16 object-cover rounded-md" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
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

export default Products;
