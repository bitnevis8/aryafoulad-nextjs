"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchUsers = useCallback(async (query = '', sort = sortBy, order = sortOrder, page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ENDPOINTS.users.getAll}?q=${query}&sortBy=${sort}&sortOrder=${order}&page=${page}&limit=5`);
      const data = await response.json();
      if (data.success) {
        if (data.data && Array.isArray(data.data.users)) {
          setUsers(data.data.users);
          setTotalPages(data.data.pagination?.totalPages || 1);
          setTotalCount(data.data.pagination?.totalCount || data.data.users.length);
          setHasNextPage(!!data.data.pagination?.hasNextPage);
          setHasPrevPage(!!data.data.pagination?.hasPrevPage);
        } else if (Array.isArray(data.data)) {
          setUsers(data.data);
          setTotalPages(1);
          setTotalCount(data.data.length);
          setHasNextPage(false);
          setHasPrevPage(false);
        } else {
          setUsers([]);
          setTotalPages(1);
          setTotalCount(0);
          setHasNextPage(false);
          setHasPrevPage(false);
        }
      } else {
        throw new Error(data.message || "خطا در دریافت لیست کاربران");
      }
    } catch (err) {
      setError(err.message || "خطا در ارتباط با سرور");
      setUsers([]);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(searchTerm, sortBy, sortOrder, 1);
  };

  const handleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    fetchUsers(searchTerm, column, newSortOrder, 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchUsers(searchTerm, sortBy, sortOrder, newPage);
  };

  const handleDelete = async (userId) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) {
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.users.delete(userId), {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("کاربر با موفقیت حذف شد.");
        fetchUsers(searchTerm, sortBy, sortOrder, currentPage); // Refresh current page
      } else {
        throw new Error(data.message || "خطا در حذف کاربر");
      }
    } catch (err) {
      alert(err.message || "خطا در ارتباط با سرور");
      console.error("Error deleting user:", err);
    }
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortOrder === "asc" ? "▲" : "▼";
    }
    return "";
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">مدیریت کاربران</h1>

        <div className="mb-4 text-sm text-gray-600">
          مجموع {totalCount} کاربر در {totalPages} صفحه
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
          <div className="w-full md:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              placeholder="جستجو بر اساس نام، ایمیل، نام کاربری..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              جستجو
            </button>
          </div>
          <button
            onClick={() => router.push("/dashboard/user-management/users/create")}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            افزودن کاربر جدید
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("firstName")}
                >
                  نام {getSortIcon("firstName")}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("lastName")}
                >
                  نام خانوادگی {getSortIcon("lastName")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ایمیل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام کاربری
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نقش‌ها
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  تاریخ ایجاد {getSortIcon("createdAt")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    کاربری یافت نشد.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition duration-150 ease-in-out`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.firstName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {user.roles && user.roles.length > 0
                        ? user.roles.map((role) => role.nameFa).join(", ")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => router.push(`/dashboard/user-management/users/${user.id}/view`)}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-sm w-full sm:w-auto"
                      >
                        مشاهده
                      </button>
                      <button 
                        onClick={() => router.push(`/dashboard/user-management/users/${user.id}/edit`)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-sm w-full sm:w-auto"
                      >
                        ویرایش
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-sm w-full sm:w-auto"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              قبلی
            </button>
            
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out ${
                    currentPage === page 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 