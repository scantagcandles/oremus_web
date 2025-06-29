'use client';

import React from 'react';
import { useParish } from '@/hooks/useParish';
import { AnnouncementsList } from '@/components/admin/announcements/AnnouncementsList';

export default function AnnouncementsPage() {
  return (
    <div className="p-6">
      <AnnouncementsList />
    </div>
  );
}
