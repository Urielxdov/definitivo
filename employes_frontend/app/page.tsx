'use client';

import { useState } from 'react';
import { EntityType } from '@/types/index';
import Tabs from '@/components/Tabs';
import EntityList from '@/components/EntityList';

export default function Page() {
  const [activeTab, setActiveTab] = useState<EntityType>('employees');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Employees Database</h1>
          <p className="text-gray-600 mt-1">Manage your employees, departments, salaries, and roles</p>
        </div>
      </header>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <EntityList entity={activeTab} />
      </main>
    </div>
  );
}
