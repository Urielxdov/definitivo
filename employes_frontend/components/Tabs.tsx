'use client';

import { EntityType } from '@/types/index';

const ENTITIES: { label: string; value: EntityType }[] = [
  { label: 'Employees', value: 'employees' },
  { label: 'Departments', value: 'departments' },
  { label: 'Salaries', value: 'salaries' },
  { label: 'Titles', value: 'titles' },
  { label: 'Dept Assignments', value: 'dept_emp' },
  { label: 'Managers', value: 'dept_manager' },
  { label: 'Salary Groups', value: 'salary_groups' },
  { label: 'SG Assignments', value: 'sg_emp' },
  { label: 'Countries', value: 'countries' },
  { label: 'Regions', value: 'regions' },
  { label: 'Region Assignments', value: 'region_emp' },
];

interface TabsProps {
  activeTab: EntityType;
  onTabChange: (tab: EntityType) => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex gap-8 px-6 py-4">
        {ENTITIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onTabChange(value)}
            className={`pb-3 font-medium transition-colors ${
              activeTab === value
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
