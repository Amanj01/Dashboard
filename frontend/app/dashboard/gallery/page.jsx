"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

  function Gallery() {
  const { data: session } = useSession();
  const [galleries, setGalleries] = useState([]);
  const [products, setProducts] = useState([]); // New state for products
  const [newGallery, setNewGallery] = useState({ product: "", images: [] });
  const [imageFiles, setImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGalleries();
    fetchProducts(); // Fetch products when component mounts
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchGalleries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/galleries");
      setGalleries(res.data);
    } catch (error) {
      toast.error("Failed to fetch galleries");
      router.push('/auth/signin');
    }
  };

  const handleAddGallery = async () => {
    if (!newGallery.product || imageFiles.length === 0) {
      toast.warning("Please fill all fields");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("product", newGallery.product);
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      await axios.post("http://localhost:5000/api/galleries/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
      });
      fetchGalleries();
      setNewGallery({ product: "", images: [] });
      setImageFiles([]);
      toast.success("Gallery added successfully!");
    } catch (error) {
      toast.error("Failed to add gallery");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (window.confirm("Are you sure you want to delete this gallery?")) {
      try {
        await axios.delete(`http://localhost:5000/api/galleries/delete/${id.trim()}`, {
          headers: {
            "Authorization": `Bearer ${session.user.accessToken}`,
          },
        });
        fetchGalleries();
        toast.success("Gallery deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete gallery");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Product Gallery Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={newGallery.product}
                onChange={(e) => setNewGallery({ ...newGallery, product: e.target.value })}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <input
                type="file"
                multiple
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
              />
            </div>
            <div className="col-span-1">
              <button
                onClick={handleAddGallery}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Gallery"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
        {/* Mobile view with scroll */}
        <div className="block sm:hidden overflow-y-auto max-h-[calc(100vh-20rem)]">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table content for mobile */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {galleries.map((gallery) => (
                <tr key={gallery._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gallery.product?.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {gallery.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000/${image}`}
                          alt={`gallery-${index}`}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteGallery(gallery._id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop/Tablet view with scroll */}
        <div className="hidden sm:block overflow-y-auto" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
          <table className="min-w-full divide-y divide-gray-200">
            {/* Same table content as mobile */}
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {galleries.map((gallery) => (
                <tr key={gallery._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gallery.product?.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {gallery.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000/${image}`}
                          alt={`gallery-${index}`}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteGallery(gallery._id)}
                      className="text-red-600 hover:text-red-900 font-medium"
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
  </div>
</div>

      </div>
      <ToastContainer position="bottom-right" />
    </DashboardLayout>
  );
}

export default Gallery;
