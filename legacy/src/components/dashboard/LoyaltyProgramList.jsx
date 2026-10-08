import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Edit, Trash2, Users, TrendingUp } from 'lucide-react';

export default function LoyaltyProgramList({ workspaceId, onEdit }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['loyaltyPrograms', workspaceId],
    queryFn: () => base44.entities.LoyaltyProgram.filter({ workspace_id: workspaceId }),
  });

  const deleteProgram = useMutation({
    mutationFn: (id) => base44.entities.LoyaltyProgram.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyPrograms'] });
    },
  });

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch = program.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [programs, search, filterStatus]);

  const { getVirtualItems, getTotalSize } = useVirtualizer({
    count: filteredPrograms.length,
    getScrollElement: () => document.getElementById('programs-list'),
    estimateSize: () => 120,
    overscan: 10,
  });

  const virtualItems = getVirtualItems();

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando programas...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 dark:bg-slate-800 dark:text-white"
            aria-label="Search programs"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border dark:border-slate-700 rounded-md dark:bg-slate-800 dark:text-white"
          aria-label="Filter by status"
        >
          <option value="all">Todos Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block border dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                  Programa
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                  Membros
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                  Pontos Emitidos
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-900 dark:text-white">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((program) => (
                <tr
                  key={program.id}
                  className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{program.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {program.points_per_dollar} pt por $
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Users className="w-4 h-4" />
                      {program.member_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <TrendingUp className="w-4 h-4" />
                      {program.total_points_issued?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[program.status]}>
                      {program.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(program)}
                        aria-label={`Edit ${program.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Tem certeza?')) {
                            deleteProgram.mutate(program.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`Delete ${program.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3" id="programs-list">
        {filteredPrograms.map((program) => (
          <div
            key={program.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">{program.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {program.points_per_dollar} pt por $
                </p>
              </div>
              <Badge className={statusColors[program.status]}>
                {program.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {program.member_count || 0} membros
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {program.total_points_issued?.toLocaleString() || 0} pts
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onEdit(program)}
                variant="outline"
                aria-label={`Edit ${program.name}`}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm('Tem certeza?')) {
                    deleteProgram.mutate(program.id);
                  }
                }}
                className="text-red-600 hover:text-red-700"
                aria-label={`Delete ${program.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          Nenhum programa encontrado
        </div>
      )}
    </div>
  );
}