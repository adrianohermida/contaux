import React from 'react';
import ContactImportCSVDialog from './ContactImportCSVDialog';
import ContactTagManager from '../ContactTagManager';
import ContactTagStatistics from '../ContactTagStatistics';
import ContactModal from './ContactModal';

export default function ContactModals({
  showImport,
  onCloseImport,
  showTagManager,
  onCloseTagManager,
  showTagStats,
  onCloseTagStats,
  workspaceId
}) {
  return (
    <>
      <ContactModal 
        open={showImport}
        onClose={onCloseImport}
        title="Importar Contatos"
      >
        <ContactImportCSVDialog 
          open={showImport}
          onClose={onCloseImport}
          workspaceId={workspaceId}
        />
      </ContactModal>

      <ContactModal 
        open={showTagManager}
        onClose={onCloseTagManager}
        title="Gerenciar Tags"
      >
        <ContactTagManager 
          workspaceId={workspaceId}
          onClose={onCloseTagManager}
        />
      </ContactModal>

      <ContactModal 
        open={showTagStats}
        onClose={onCloseTagStats}
        title="Estatísticas de Tags"
      >
        <ContactTagStatistics workspaceId={workspaceId} />
      </ContactModal>
    </>
  );
}