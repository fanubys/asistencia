import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import { useData } from '../hooks/useData.ts';
import { AttendanceStatus } from '../types.ts';
import { useTheme } from '../hooks/useTheme.ts';

const COLORS: Record<AttendanceStatus, { light: string, dark: string }> = {
  [AttendanceStatus.Presente]: { light: '#10b981', dark: '#34d399' },
  [AttendanceStatus.Ausente]: { light: '#ef4444', dark: '#f87171' },
  [AttendanceStatus.Tardanza]: { light: '#f59e0b', dark: '#fbbf24' },
  [AttendanceStatus.Justificado]: { light: '#3b82f6', dark: '#60a5fa' },
};

const StatisticsPage: React.FC = () => {
  const { state } = useData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = { 
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f1f5f9' : '#0f172a',
    backdropFilter: 'blur(4px)',
    borderRadius: '0.5rem'
  };

  const groupAttendanceData = useMemo(() => {
    return state.groups.map(group => {
      const groupStudentIds = new Set(group.students.map(s => s.id));
      const groupAttendance = state.attendance.filter(a => groupStudentIds.has(a.studentId));
      const totalPossible = groupAttendance.length;
      const presentCount = groupAttendance.filter(a => a.status === AttendanceStatus.Presente || a.status === AttendanceStatus.Tardanza).length;
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
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Porcentaje de Asistencia por Grupo</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={groupAttendanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(203, 213, 225, 0.5)"} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis unit="%" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(100, 116, 139, 0.1)' : 'rgba(203, 213, 225, 0.3)' }} />
              <Legend wrapperStyle={{ fontSize: '14px' }}/>
              <Bar dataKey="Asistencia" fill={isDark ? COLORS.Presente.dark : COLORS.Presente.light} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Distribución General de Asistencia</h3>
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
                stroke={isDark ? '#0f172a' : '#ffffff'}
                className="focus:outline-none"
              >
                {overallStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={isDark ? COLORS[entry.name as AttendanceStatus].dark : COLORS[entry.name as AttendanceStatus].light} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '14px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPage;