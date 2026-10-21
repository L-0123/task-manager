import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import TaskManagerPage from './pages/TaskManager/TaskManagerPage';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TaskManagerPage />} />
        <Route path="tasks" element={<TaskManagerPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
