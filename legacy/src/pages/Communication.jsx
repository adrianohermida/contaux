import React from 'react';
import CommunicationCenter from '../components/CommunicationCenter';

export default function Communication() {
   return (
     <div className="space-y-[var(--spacing-lg)]">
       <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)]" role="heading" aria-level="1">Central de Comunicação</h1>
       <CommunicationCenter />
     </div>
   );
 }