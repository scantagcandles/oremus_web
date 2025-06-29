'use client';

import React from 'react';
import { ParishList } from '@/components/admin/parish/ParishList';
import { PriestsList } from '@/components/admin/priests/PriestsList';

export default function ParishManagementPage() {
  return (
    <div className="p-6 space-y-8">
      <ParishList />
      <PriestsList />
    </div>
  );
}
