import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Monitor() {
  const { profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Monitor Students
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View students enrolled in the programs you oversee.
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <p className="text-gray-500 text-center py-12">
          Monitor page content will be implemented here. This page is under construction.
        </p>
      </div>
    </div>
  );
}
