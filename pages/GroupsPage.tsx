import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal.tsx';
import ConfirmationModal from '../components/ui/ConfirmationModal.tsx';
import { useData } from '../hooks/useData.ts';
import { Group } from '../types.ts';
import { PlusCircleIcon, ArrowRightIcon, TrashIcon } from '../components/ui/Icons.tsx';

const GroupsPage: React.FC = () => {
  const { state, addGroup, deleteGroup } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', grade: '', estimatedStudents: '' });

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addGroup({
        name: newGroup.name,
        grade: newGroup.grade,
        estimatedStudents: parseInt(newGroup.estimatedStudents, 10) || 0,
      });
      setNewGroup({ name: '', grade: '', estimatedStudents: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add group:", error);
      alert("Error: No se pudo crear el grupo.");
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
      await deleteGroup(groupToDelete.id);
      setGroupToDelete(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Header
        title="Mis Grupos"
        actions={<Button onClick={() => setIsModalOpen(true)}><PlusCircleIcon /> Crear Grupo</Button>}
      />
      {state.groups.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay grupos creados. ¡Crea el primero!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {state.groups.map(group => (
            <Card key={group.id} className="hover:border-primary-500 border-2 border-transparent transition-colors duration-200">
              <div className="flex justify-between items-center">
                  <Link to={`/grupos/${group.id}`} className="flex-grow flex items-center">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-primary-700 dark:text-primary-300">{group.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{group.grade}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.students.length} / {group.estimatedStudents} estudiantes</p>
                    </div>
                    <ArrowRightIcon/>
                  </Link>
                  <button 
                    onClick={(e) => handleDeleteClick(e, group)} 
                    className="p-2 ml-4 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors"
                    aria-label={`Eliminar grupo ${group.name}`}
                  >
                    <TrashIcon />
                  </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal title="Crear Nuevo Grupo" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleAddGroup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Grupo</label>
            <input type="text" id="name" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" required />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grado / Curso</label>
            <input type="text" id="grade" value={newGroup.grade} onChange={e => setNewGroup({ ...newGroup, grade: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" required />
          </div>
          <div>
            <label htmlFor="estimatedStudents" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº Estudiantes (aprox)</label>
            <input type="number" id="estimatedStudents" value={newGroup.estimatedStudents} onChange={e => setNewGroup({ ...newGroup, estimatedStudents: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Grupo'}
            </Button>
          </div>
        </form>
      </Modal>
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