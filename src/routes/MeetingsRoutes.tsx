
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MeetingsPage from '@/pages/MeetingsPage';
import MeetingDetailsPage from '@/pages/MeetingDetailsPage';

export const MeetingsRoutes = [
  <Route
    key="meetings"
    path="/meetings"
    element={
      <ProtectedRoute>
        <MeetingsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="meeting-details"
    path="/meetings/:id"
    element={
      <ProtectedRoute>
        <MeetingDetailsPage />
      </ProtectedRoute>
    }
  />
];
