import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ContactNotesList from '../ContactNotesList';
import ContactActivityTimeline from '../ContactActivityTimeline';
import ContactTagSelector from '../ContactTagSelector';
import ContactRelationshipManager from '../ContactRelationshipManager';
import ContactAttachments from '../ContactAttachments';
import DuplicateDetector from '../DuplicateDetector';
import ContactMetadata from '../ContactMetadata';
import LazyTabContent from '../LazyTabContent';

export default function ContactDetailsTabs({ contact, contactId, workspaceId, formData, onEditClick }) {
  const [activeTab, setActiveTab] = useState('info');
  const [loadedTabs, setLoadedTabs] = useState(new Set(['info']));

  const handleTabChange = (value) => {
    setActiveTab(value);
    setLoadedTabs(prev => new Set([...prev, value]));
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="notes">Notas</TabsTrigger>
        <TabsTrigger value="activity">Atividades</TabsTrigger>
        <TabsTrigger value="tags">Tags</TabsTrigger>
        <TabsTrigger value="relationships">Relações</TabsTrigger>
        <TabsTrigger value="files">Arquivos</TabsTrigger>
        <TabsTrigger value="duplicates">Duplicatas</TabsTrigger>
      </TabsList>

      <LazyTabContent value="info" activeTab={activeTab}>
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Informações do Contato</CardTitle>
            <Button onClick={onEditClick} variant="outline" size="sm">
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            <ContactInfoDisplay formData={formData} contact={contact} workspaceId={workspaceId} contactId={contactId} />
          </CardContent>
        </Card>
      </LazyTabContent>

      <LazyTabContent value="notes" activeTab={activeTab} loading={!loadedTabs.has('notes')}>
        {loadedTabs.has('notes') && <ContactNotesList contactId={contactId} workspaceId={workspaceId} />}
      </LazyTabContent>

      <LazyTabContent value="activity" activeTab={activeTab} loading={!loadedTabs.has('activity')}>
        {loadedTabs.has('activity') && <ContactActivityTimeline contactId={contactId} workspaceId={workspaceId} />}
      </LazyTabContent>

      <LazyTabContent value="tags" activeTab={activeTab} loading={!loadedTabs.has('tags')}>
        {loadedTabs.has('tags') && (
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Tags do Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactTagSelector contactId={contactId} workspaceId={workspaceId} />
            </CardContent>
          </Card>
        )}
      </LazyTabContent>

      <LazyTabContent value="relationships" activeTab={activeTab} loading={!loadedTabs.has('relationships')}>
        {loadedTabs.has('relationships') && (
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Relacionamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactRelationshipManager contactId={contactId} workspaceId={workspaceId} />
            </CardContent>
          </Card>
        )}
      </LazyTabContent>

      <LazyTabContent value="files" activeTab={activeTab} loading={!loadedTabs.has('files')}>
        {loadedTabs.has('files') && (
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Arquivos Anexados</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactAttachments contactId={contactId} workspaceId={workspaceId} />
            </CardContent>
          </Card>
        )}
      </LazyTabContent>

      <LazyTabContent value="duplicates" activeTab={activeTab} loading={!loadedTabs.has('duplicates')}>
        {loadedTabs.has('duplicates') && <DuplicateDetector workspaceId={workspaceId} contactId={contactId} />}
      </LazyTabContent>
    </Tabs>
  );
}

function ContactInfoDisplay({ formData, contact, workspaceId, contactId }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Nome da Empresa</label>
          <p className="text-slate-700 dark:text-slate-300">{formData?.company_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Email</label>
          <p className="text-slate-700 dark:text-slate-300">{formData?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Telefone</label>
          <p className="text-slate-700 dark:text-slate-300">{formData?.phone || '—'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Tipo</label>
          <p className="text-slate-700 dark:text-slate-300">{formData?.client_type === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
            {formData?.client_type === 'pf' ? 'CPF' : 'CNPJ'}
          </label>
          <p className="text-slate-700 dark:text-slate-300">
            {formData?.client_type === 'pf' ? (formData?.cpf || '—') : (formData?.cnpj || '—')}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Status</label>
          <p className="text-slate-700 dark:text-slate-300">
            {formData?.status === 'active' ? 'Ativo' : 'Inativo'}
          </p>
        </div>
      </div>

      {(formData?.endereco || formData?.cidade) && (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData?.cep && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">CEP</label>
                <p className="text-slate-700 dark:text-slate-300">{formData.cep}</p>
              </div>
            )}
            {formData?.endereco && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Rua</label>
                <p className="text-slate-700 dark:text-slate-300">{formData.endereco}</p>
              </div>
            )}
            {formData?.numero && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Número</label>
                <p className="text-slate-700 dark:text-slate-300">{formData.numero}</p>
              </div>
            )}
            {formData?.complemento && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Complemento</label>
                <p className="text-slate-700 dark:text-slate-300">{formData.complemento}</p>
              </div>
            )}
            {formData?.bairro && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Bairro</label>
                <p className="text-slate-700 dark:text-slate-300">{formData.bairro}</p>
              </div>
            )}
            {formData?.cidade && (
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Cidade</label>
                <p className="text-slate-700 dark:text-slate-300">{formData.cidade} - {formData.uf}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ContactMetadata contact={contact} />
    </div>
  );
}

export { ContactInfoDisplay };