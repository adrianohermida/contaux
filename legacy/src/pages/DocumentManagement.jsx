import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMultitenantAuthOptimized } from '../components/auth/useMultitenantAuthOptimized';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Edit2, Trash2, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import DocumentTemplateForm from '../components/dashboard/DocumentTemplateForm';

export default function DocumentManagement() {
  const { workspaceId, loading: authLoading } = useMultitenantAuthOptimized('internal');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const { data: templates = [], isLoading, refetch, error } = useQuery({
    queryKey: ['DocumentTemplate-list', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return base44.entities.DocumentTemplate.filter(
        { tenant_id: workspaceId },
        'template_name',
        100
      );
    },
    enabled: !!workspaceId && !authLoading,
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId) => base44.entities.DocumentTemplate.delete(templateId),
    onSuccess: () => {
      toast.success('Modelo deletado com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao deletar modelo: ' + error.message);
    }
  });

  const copyMutation = useMutation({
    mutationFn: async (template) => {
      const copiedTemplate = {
        ...template,
        template_name: `${template.template_name} (Cópia)`,
        is_default: false
      };
      delete copiedTemplate.id;
      delete copiedTemplate.created_date;
      delete copiedTemplate.updated_date;
      delete copiedTemplate.created_by;
      
      return base44.entities.DocumentTemplate.create(copiedTemplate);
    },
    onSuccess: () => {
      toast.success('Modelo duplicado com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao duplicar modelo: ' + error.message);
    }
  });

  const filteredTemplates = templates.filter(template => {
    return filterType === 'all' || template.template_type === filterType;
  });

  const handleDeleteTemplate = (templateId, name) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleCopyTemplate = (template) => {
    copyMutation.mutate(template);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[var(--color-foreground-secondary)]">Carregando...</div>
      </div>
    );
  }

  if (error && !templates.length) {
    return (
      <div className="space-y-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Gerenciamento de Documentos</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-[var(--spacing-2xl)] text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-[var(--spacing-md)]" />
          <p className="text-red-600 mb-[var(--spacing-md)]">Erro ao carregar modelos</p>
          <Button onClick={() => refetch()} className="gap-[var(--spacing-sm)]">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showForm && (
        <DocumentTemplateForm
          tenantId={workspaceId}
          editingTemplate={editingTemplate}
          onSuccess={() => {
            setShowForm(false);
            setEditingTemplate(null);
            refetch();
          }}
          onClose={() => {
            setShowForm(false);
            setEditingTemplate(null);
          }}
        />
      )}
      <div className="space-y-[var(--spacing-lg)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]">Gerenciamento de Documentos</h1>
            <p className="text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">Crie e gerencie modelos de documentos</p>
          </div>
          <div className="flex gap-[var(--spacing-sm)]">
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-[var(--spacing-sm)]" disabled={isLoading}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-[var(--color-interactive-default)] hover:bg-[var(--color-interactive-hover)] gap-[var(--spacing-sm)]">
              <Plus className="w-4 h-4" />
              Novo Modelo
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-[var(--spacing-md)]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Tipo de Documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="invoice">Fatura</SelectItem>
                  <SelectItem value="quote">Orçamento</SelectItem>
                  <SelectItem value="statement">Extrato</SelectItem>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                  <SelectItem value="letter">Carta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Modelos */}
        <Card>
          <CardContent className="pt-[var(--spacing-lg)]">
            {isLoading ? (
              <div className="text-center py-[var(--spacing-lg)] text-[var(--color-foreground-secondary)]">Carregando modelos...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-[var(--spacing-md)]" />
                <p className="text-[var(--color-foreground-secondary)] font-medium">Nenhum modelo encontrado</p>
                <p className="text-[var(--color-foreground-secondary)] text-sm mt-[var(--spacing-xs)]">Tente ajustar seus filtros de busca</p>
              </div>
            ) : (
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-[var(--spacing-md)] flex-1">
                          <FileText className="w-5 h-5 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{template.template_name}</h3>
                              {template.is_default && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--color-foreground-secondary)] mt-[var(--spacing-xs)]">{template.description}</p>
                            <div className="flex gap-[var(--spacing-sm)] mt-[var(--spacing-sm)]">
                              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                                {template.template_type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {template.status === 'active' ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            {template.created_by && (
                              <p className="text-xs text-slate-500 mt-2">
                                Criado por {template.created_by}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-[var(--spacing-sm)] ml-[var(--spacing-md)]">
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleEditTemplate(template)}
                             title="Editar"
                           >
                             <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleCopyTemplate(template)}
                             title="Duplicar"
                           >
                             <Copy className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleDeleteTemplate(template.id, template.template_name)}
                             disabled={deleteMutation.isPending}
                             className="text-red-600 hover:text-red-700 disabled:opacity-50"
                             title="Excluir"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}