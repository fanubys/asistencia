
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { useData } from '../hooks/useData.ts';
import { AttendanceStatus } from '../types.ts';
import { useTheme } from '../hooks/useTheme.ts';
import { generateAttendanceSummary, AttendanceSummary } from '../lib/gemini.ts';

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

  const [aiSummary, setAiSummary] = useState<AttendanceSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string>('');

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
  
  const totalStudents = useMemo(() => {
    return state.groups.reduce((acc, group) => acc + group.students.length, 0);
  }, [state.groups]);

  const handleGenerateSummary = async () => {
    if (state.attendance.length < 5) {
      setAiError("No hay suficientes datos de asistencia para generar un análisis. ¡Registra la asistencia de varios días primero!");
      setAiSummary(null);
      return;
    }
    setIsGenerating(true);
    setAiSummary(null);
    setAiError('');
    try {
      const summary = await generateAttendanceSummary({
        groupAttendanceData,
        overallStatusData,
        totalStudents,
      });
      setAiSummary(summary);
    } catch (error: any) {
      console.error(error);
      setAiError(error.message || 'Ocurrió un error inesperado al contactar al asistente de IA.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <Header title="Estadísticas" />

      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Análisis con IA ✨</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Obtén un resumen inteligente y consejos de Profe-Bot.
                </p>
            </div>
            {!isGenerating && (
                 <Button 
                    onClick={handleGenerateSummary} 
                    disabled={isGenerating} 
                    variant={aiSummary ? 'secondary' : 'primary'}
                    className="w-full sm:w-auto flex-shrink-0"
                  >
                    {aiSummary ? 'Generar de Nuevo' : 'Generar Análisis'}
                  </Button>
            )}
        </div>
        
        {isGenerating && (
            <div className="text-center py-6">
                <div role="status" className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Profe-Bot está analizando los datos...</p>
            </div>
        )}
        
        {aiError && !isGenerating && (
             <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg animate-fade-in">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">¡Oh, no!</p>
                <p className="text-sm text-red-700 dark:text-red-300">{aiError}</p>
            </div>
        )}

        {aiSummary && !isGenerating &&(
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg space-y-4 animate-fade-in">
                <h4 className="text-xl font-bold text-primary-600 dark:text-primary-400">{aiSummary.title}</h4>
                <div>
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300">Resumen Clave:</h5>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                        {aiSummary.summaryPoints.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                </div>
                 <div>
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300">Sugerencias del Bot:</h5>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                        {aiSummary.suggestions.map((sugg, i) => <li key={i}>{sugg}</li>)}
                    </ul>
                </div>
            </div>
        )}
      </Card>

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
