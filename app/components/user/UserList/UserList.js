"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import { fetchWithCredentials } from '@/app/utils/fetch';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const UserList = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await fetchWithCredentials(`${API_ENDPOINTS.users.getAll}?page=${page}&limit=5`);
      console.log('UserList API response:', data); // Debug log
      let usersArr = [];
      if (data && data.data) {
        if (Array.isArray(data.data.users)) {
          usersArr = data.data.users;
          setTotalPages(data.data.pagination?.totalPages || 1);
          setTotalCount(data.data.pagination?.totalCount || usersArr.length);
          setHasNextPage(!!data.data.pagination?.hasNextPage);
          setHasPrevPage(!!data.data.pagination?.hasPrevPage);
        } else if (Array.isArray(data.data)) {
          usersArr = data.data;
          setTotalPages(1);
          setTotalCount(usersArr.length);
          setHasNextPage(false);
          setHasPrevPage(false);
        }
      }
      setUsers(Array.isArray(usersArr) ? usersArr : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setUsers([]); // Ensure users is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;
    try {
      await fetchWithCredentials(API_ENDPOINTS.users.delete(id), {
        method: 'DELETE'
      });
      // Refresh current page after deletion
      fetchUsers(currentPage);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message || 'خطا در حذف کاربر');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">لیست کاربران</h2>
        <Button
          onClick={() => router.push('/dashboard/user-management/users/create')}
          variant="primary"
        >
          افزودن کاربر جدید
        </Button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        مجموع {totalCount} کاربر در {totalPages} صفحه
      </div>

      <Table
        headers={[
          { key: 'id', label: 'شناسه' },
          { key: 'username', label: 'نام کاربری' },
          { key: 'email', label: 'ایمیل' },
          { key: 'firstName', label: 'نام' },
          { key: 'lastName', label: 'نام خانوادگی' },
          { key: 'personnelNumber', label: 'شماره پرسنلی' },
          { key: 'actions', label: 'عملیات' }
        ]}
        data={Array.isArray(users) ? users.map(user => ({
          ...user,
          actions: (
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/dashboard/user-management/users/${user.id}`)}
                variant="secondary"
                size="small"
              >
                مشاهده
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/user-management/users/${user.id}/edit`)}
                variant="secondary"
                size="small"
              >
                ویرایش
              </Button>
              <Button
                onClick={() => handleDelete(user.id)}
                variant="danger"
                size="small"
              >
                حذف
              </Button>
            </div>
          )
        })) : []}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            variant="secondary"
            size="small"
          >
            قبلی
          </Button>
          
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? "primary" : "secondary"}
                size="small"
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            variant="secondary"
            size="small"
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserList; 