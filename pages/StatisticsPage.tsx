import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import { useData } from '../hooks/useData.ts';
import { AttendanceStatus } from '../types.ts';

const COLORS = {
  [AttendanceStatus.Presente]: '#10b981',
  [AttendanceStatus.Ausente]: '#ef4444',
  [AttendanceStatus.Tardanza]: '#f59e0b',
  [AttendanceStatus.Justificado]: '#3b82f6',
};

const StatisticsPage: React.FC = () => {
  const { state } = useData();

  const groupAttendanceData = useMemo(() => {
    return state.groups.map(group => {
      const groupStudentIds = new Set(group.students.map(s => s.id));
      const groupAttendance = state.attendance.filter(a => groupStudentIds.has(a.studentId));
      const totalPossible = groupAttendance.length;
      const presentCount = groupAttendance.filter(a => a.status === AttendanceStatus.Presente).length;
      const percentage = totalPossible > 0 ? (presentCount / totalPossible) * 100 : 0;
      return {
        name: group.name,
        Asistencia: parseFloat(percentage.toFixed(1)),
      };
    });
  }, [state.groups, state.attendance]);

  const overallStatusData = useMemo(() => {
    const statusCounts = state.attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<AttendanceStatus, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [state.attendance]);
  
  return (
    <div className="p-4 space-y-6">
      <Header title="Estadísticas" />

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Porcentaje de Asistencia por Grupo</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={groupAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis unit="%" stroke="#6b7280" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: '#4b5563',
                  color: '#ffffff'
                }} 
              />
              <Legend />
              <Bar dataKey="Asistencia" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Distribución General de Asistencia</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={overallStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {overallStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as AttendanceStatus]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: '#4b5563',
                  color: '#ffffff'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPage;