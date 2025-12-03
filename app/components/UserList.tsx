"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface User {
  email: string;
  created_at: string;
  email_verified: boolean;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createSupabaseBrowserClient();
      
      const { data, error: fetchError } = await supabase.rpc('get_all_users');
      
      if (fetchError) throw fetchError;
      
      setUsers(data || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmails = () => {
    const emailList = users.map(u => u.email).join('\n');
    navigator.clipboard.writeText(emailList);
    alert('Email list copied to clipboard!');
  };

  const handleExportCSV = () => {
    const csv = [
      ['Email', 'Signup Date', 'Email Verified'].join(','),
      ...users.map(u => [
        u.email,
        new Date(u.created_at).toLocaleDateString(),
        u.email_verified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-gray-600 text-center">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 font-medium">Error loading users</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Registered Users</h2>
          <p className="text-gray-600 text-sm">
            Total: {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyEmails}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
          >
            Copy Emails
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No users have signed up yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Signup Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-900">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        user.email_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.email_verified ? 'Yes' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

