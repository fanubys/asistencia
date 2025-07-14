

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal.tsx';
import ConfirmationModal from '../components/ui/ConfirmationModal.tsx';
import { useData } from '../hooks/useData.ts';
import { Group, Student } from '../types.ts';
import { PlusCircleIcon, ArrowRightIcon, TrashIcon, UsersIcon, UploadIcon, PencilIcon } from '../components/ui/Icons.tsx';
import { generateAvatar } from '../lib/gemini.ts';

const GroupsPage: React.FC = () => {
  const { state, addGroup, editGroup, deleteGroup, addStudentsBulk } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  const [newGroup, setNewGroup] = useState({ name: '', grade: '' });
  const [editGroupData, setEditGroupData] = useState({ name: '', grade: '' });
  const [importGroupData, setImportGroupData] = useState({ name: '', grade: '', file: null as File | null });

  const handleOpenEditModal = (group: Group) => {
    setGroupToEdit(group);
    setEditGroupData({ name: group.name, grade: group.grade });
    setIsEditModalOpen(true);
  };
  
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addGroup({ name: newGroup.name, grade: newGroup.grade });
      setNewGroup({ name: '', grade: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add group:", error);
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupToEdit) return;
    setIsSubmitting(true);
    try {
      await editGroup(groupToEdit.id, editGroupData);
      setGroupToEdit(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to edit group:", error);
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, group: Group) => {
    e.preventDefault();
    e.stopPropagation();
    setGroupToDelete(group);
  };

  const handleConfirmDelete = async () => {
    if (groupToDelete) {
      try {
        await deleteGroup(groupToDelete.id);
        setGroupToDelete(null);
      } catch (error) {
        console.error("Failed to delete group:", error);
        alert((error as Error).message);
      }
    }
  };
  
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImportGroupData(prev => ({ ...prev, file: event.target.files![0] }));
    }
  };

  const handleImportGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importGroupData.file || !importGroupData.name) {
      alert("Por favor, completa el nombre del grupo y selecciona un archivo.");
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create the group
      const newGroupId = await addGroup({ name: importGroupData.name, grade: importGroupData.grade });

      // 2. Parse CSV and add students
      Papa.parse(importGroupData.file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const studentData = (results.data as any[]).map(row => {
              const name = (row.nombre || row.name || '').trim();
              const lastName = (row.apellido || row.lastname || '').trim();
              const fullName = `${name} ${lastName}`.trim();
              if (!fullName) return null;
              return { name: fullName };
            }).filter(Boolean) as { name: string }[];

            if (studentData.length === 0) {
              alert("No se encontraron estudiantes válidos en el archivo. Asegúrate de que las columnas se llamen 'nombre' y/o 'apellido'.");
              setIsSubmitting(false);
              return;
            }

            const newStudents: Student[] = [];
            for (const [index, data] of studentData.entries()) {
                const photoUrl = await generateAvatar(data.name);
                newStudents.push({
                  id: `s${Date.now()}-${index}`,
                  name: data.name,
                  photoUrl: photoUrl,
                  observations: '',
                });
            }
            
            await addStudentsBulk(newGroupId, newStudents);
            alert(`Grupo "${importGroupData.name}" creado con ${newStudents.length} estudiantes importados.`);
            setIsImportModalOpen(false);
            setImportGroupData({ name: '', grade: '', file: null });

          } catch (error) {
            console.error("Error processing students for import:", error);
            alert((error as Error).message || 'Ocurrió un error al generar los avatares e importar los estudiantes.');
          } finally {
            setIsSubmitting(false);
          }
        },
        error: (error) => {
            alert(`Error al importar el archivo: ${error.message}`);
            setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Failed to import group:", error);
      alert((error as Error).message);
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-4 space-y-6">
      <Header
        title="Mis Grupos"
        actions={
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setIsImportModalOpen(true)}>
              <UploadIcon /> Importar Grupo
            </Button>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircleIcon /> Crear Grupo
            </Button>
          </div>
        }
      />
      {state.groups.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <UsersIcon className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">No hay grupos creados</h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400">¡Crea o importa el primero para empezar a pasar lista!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {state.groups.map((group, index) => (
            <div key={group.id} className="list-item-animation" style={{ animationDelay: `${index * 70}ms` }}>
              <Card onClick={() => navigate(`/grupos/${group.id}`)}>
                <div className="flex justify-between items-center">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-primary-700 dark:text-primary-300">{group.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{group.grade}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.students.length} estudiantes</p>
                    </div>
                    <div className="flex items-center space-x-1 z-10 relative">
                      <button 
                        onClick={(e) => {e.stopPropagation(); handleOpenEditModal(group);}}
                        className="p-2 rounded-full text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors"
                        aria-label={`Editar grupo ${group.name}`}
                      >
                        <PencilIcon />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, group)} 
                        className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors"
                        aria-label={`Eliminar grupo ${group.name}`}
                      >
                        <TrashIcon />
                      </button>
                      <ArrowRightIcon/>
                    </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
      {/* Add Modal */}
      <Modal title="Crear Nuevo Grupo" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddGroup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Grupo</label>
            <input type="text" id="name" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Grado / Curso</label>
            <input type="text" id="grade" value={newGroup.grade} onChange={e => setNewGroup({ ...newGroup, grade: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear Grupo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Editar Grupo" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleEditGroup} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Grupo</label>
            <input type="text" id="edit-name" value={editGroupData.name} onChange={e => setEditGroupData({ ...editGroupData, name: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div>
            <label htmlFor="edit-grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Grado / Curso</label>
            <input type="text" id="edit-grade" value={editGroupData.grade} onChange={e => setEditGroupData({ ...editGroupData, grade: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" required />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal title="Importar Grupo desde CSV" isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)}>
        <form onSubmit={handleImportGroup} className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Crea un grupo y añade estudiantes desde un archivo .csv. El archivo debe tener columnas llamadas "nombre" y "apellido".</p>
            <div>
              <label htmlFor="import-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Nuevo Grupo</label>
              <input type="text" id="import-name" value={importGroupData.name} onChange={e => setImportGroupData({ ...importGroupData, name: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" required />
            </div>
            <div>
              <label htmlFor="import-grade" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Grado / Curso</label>
              <input type="text" id="import-grade" value={importGroupData.grade} onChange={e => setImportGroupData({ ...importGroupData, grade: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" required />
            </div>
            <div>
              <label htmlFor="import-file" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Archivo de Estudiantes (.csv)</label>
              <input type="file" id="import-file" accept=".csv" onChange={handleImportFileChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" required />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Importando...' : 'Importar y Crear Grupo'}
              </Button>
            </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Grupo"
        message={`¿Estás seguro de que quieres eliminar el grupo "${groupToDelete?.name}"? Se borrarán todos sus estudiantes y registros de asistencia. Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default GroupsPage;