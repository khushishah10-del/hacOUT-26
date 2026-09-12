import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import FactoryData from '../pages/FactoryData';
import EmissionAnalysis from '../pages/EmissionAnalysis';
import Recommendations from '../pages/Recommendations';
import CircularAlternatives from '../pages/CircularAlternatives';
import WhatIfSimulator from '../pages/WhatIfSimulator';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Root redirect to /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="factory-data" element={<FactoryData />} />
        <Route path="emission-analysis" element={<EmissionAnalysis />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="circular-alternatives" element={<CircularAlternatives />} />
        <Route path="what-if" element={<WhatIfSimulator />} />
        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
