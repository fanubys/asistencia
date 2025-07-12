import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Papa from 'papaparse';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal.tsx';
import ConfirmationModal from '../components/ui/ConfirmationModal.tsx';
import ImageZoom from '../components/ui/ImageZoom.tsx';
import { useData } from '../hooks/useData.ts';
import { Student } from '../types.ts';
import { PlusCircleIcon, PencilIcon, TrashIcon, UploadIcon } from '../components/ui/Icons.tsx';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { state, addStudent, editStudent, deleteStudent, addStudentsBulk } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [newStudentData, setNewStudentData] = useState({ name: '', observations: '' });
  const [editStudentData, setEditStudentData] = useState({ name: '', observations: '' });

  const group = state.groups.find(g => g.id === groupId);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !newStudentData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await addStudent(group.id, {
        name: newStudentData.name.trim(),
        observations: newStudentData.observations.trim(),
      });
      setNewStudentData({ name: '', observations: '' });
      setIsAddModalOpen(false);
    } catch(error) {
      console.error("Failed to add student:", error);
      alert("Error: no se pudo añadir al estudiante.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !studentToEdit || !editStudentData.name.trim()) return;
    setIsSubmitting(true);
    try {
      const updatedStudent: Student = { 
        ...studentToEdit, 
        name: editStudentData.name.trim(),
        observations: editStudentData.observations.trim()
      };
      await editStudent(group.id, updatedStudent);
      setStudentToEdit(null);
    } catch(error) {
      console.error("Failed to edit student:", error);
      alert("Error: no se pudo editar al estudiante.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (group && studentToDelete) {
      await deleteStudent(group.id, studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const openEditModal = (student: Student) => {
    setStudentToEdit(student);
    setEditStudentData({ name: student.name, observations: student.observations || '' });
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && group) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const newStudents = results.data.map((row: any, index: number) => {
            const name = (row.nombre || row.name || '').trim();
            const lastName = (row.apellido || row.lastname || '').trim();
            const fullName = `${name} ${lastName}`.trim();

            if (!fullName) return null;

            const randomSeed = `${Date.now()}-${index}`;
            return {
              id: `s${randomSeed}`,
              name: fullName,
              photoUrl: `https://picsum.photos/seed/${randomSeed}/100`,
              observations: '',
            };
          }).filter(Boolean) as Student[];

          if (newStudents.length > 0) {
            await addStudentsBulk(group.id, newStudents);
            alert(`${newStudents.length} estudiantes importados correctamente.`);
          }
        },
        error: (error) => {
            alert(`Error al importar el archivo: ${error.message}`);
        }
      });
      event.target.value = ''; // Reset file input
    }
  };

  if (!group) {
    return (
      <div className="p-4">
        <Header title="Grupo no encontrado" />
        <Card><p className="text-center text-red-500">El grupo que buscas no existe.</p></Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv" />
      <Header
        title={group.name}
        actions={
          <Link to={`/asistencia/${group.id}`}>
            <Button variant="primary">Pasar Lista</Button>
          </Link>
        }
      />
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold">Estudiantes ({group.students.length})</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon className="w-5 h-5"/> Importar (.csv)
            </Button>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircleIcon className="w-5 h-5" /> Añadir
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {group.students.map((student, index) => (
            <div 
              key={student.id} 
              className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 list-item-animation"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ImageZoom src={student.photoUrl || ''} alt={student.name} className="w-12 h-12 rounded-full object-cover mr-4 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-medium text-slate-800 dark:text-slate-200">{student.name}</p>
                {student.observations && (
                   <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">{student.observations}</p>
                )}
              </div>
              <div className="flex items-center space-x-1 ml-2">
                 <button onClick={() => openEditModal(student)} className="p-2 rounded-full text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors" aria-label={`Editar a ${student.name}`}>
                    <PencilIcon />
                 </button>
                 <button onClick={() => setStudentToDelete(student)} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors" aria-label={`Eliminar a ${student.name}`}>
                    <TrashIcon />
                 </button>
              </div>
            </div>
          ))}
          {group.students.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">Aún no hay estudiantes en este grupo. Añade uno o impórtalos desde un archivo CSV.</p>
          )}
        </div>
      </Card>
      
      {/* Add/Edit Student Modals */}
      <Modal title={studentToEdit ? "Editar Estudiante" : "Añadir Estudiante"} isOpen={isAddModalOpen || !!studentToEdit} onClose={() => { setIsAddModalOpen(false); setStudentToEdit(null); }}>
        <form onSubmit={studentToEdit ? handleEditStudent : handleAddStudent} className="space-y-4">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Estudiante</label>
            <input 
              type="text" 
              id="studentName" 
              value={studentToEdit ? editStudentData.name : newStudentData.name} 
              onChange={e => studentToEdit ? setEditStudentData({ ...editStudentData, name: e.target.value }) : setNewStudentData({ ...newStudentData, name: e.target.value })} 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" 
              required 
            />
          </div>
          <div>
            <label htmlFor="studentObservations" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones</label>
            <textarea 
              id="studentObservations" 
              value={studentToEdit ? editStudentData.observations : newStudentData.observations} 
              onChange={e => studentToEdit ? setEditStudentData({ ...editStudentData, observations: e.target.value }) : setNewStudentData({ ...newStudentData, observations: e.target.value })} 
              rows={3} 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" 
              placeholder="Alergias, necesidades especiales, etc." 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (studentToEdit ? 'Guardar Cambios' : 'Añadir Estudiante')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Estudiante"
        message={`¿Estás seguro de que quieres eliminar a "${studentToDelete?.name}"? Se borrarán todos sus registros de asistencia.`}
      />
    </div>
  );
};

export default GroupDetailPage;