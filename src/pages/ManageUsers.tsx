import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ManageUsers() {
  const { profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Manage Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pre-authorize users and manage roles across the application.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Pre-authorize User
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Users Directory</h3>
        <p className="text-gray-500 text-center py-12 border-t border-gray-200">
          User management table and pre-authorization form will be implemented here.
        </p>
      </div>
    </div>
  );
}
