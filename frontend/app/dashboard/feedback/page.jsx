"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../components/DashboardLayout";
import { FaTrash } from 'react-icons/fa';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedbacks", {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
      });
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await axios.delete(`http://localhost:5000/api/feedbacks/delete/${id.trim()}`, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${session.user.accessToken}`
          },
        });
        fetchFeedback();
      } catch (error) {
        console.error("Error deleting feedback:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Feedback Management</h1>
          <p className="text-gray-600">View and manage user feedback</p>
        </div>

        <div className="overflow-x-auto rounded-lg shadow">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks.map((feedback) => (
                    <tr key={feedback._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feedback.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {feedback.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {feedback.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteFeedback(feedback._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {feedbacks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No feedback entries found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Feedback;
