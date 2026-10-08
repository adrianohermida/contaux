import React, { useState, useCallback } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import ContactMergeDialog from './ContactMergeDialog';
import DuplicateStats from './duplicates/DuplicateStats';
import DuplicateResults from './duplicates/DuplicateResults';

export default function DuplicateDetector({ workspaceId, contactId = null }) {
  const [isScanning, setIsScanning] = useState(false);
  const [duplicates, setDuplicates] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const response = await base44.functions.invoke('detectDuplicates', {
        workspace_id: workspaceId,
        contact_id: contactId,
        threshold: 0.85,
      });
      setDuplicates(response.data);
    } catch (error) {
      console.error('Error scanning duplicates:', error);
      alert('Erro ao buscar duplicatas: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  }, [workspaceId, contactId]);

  const handleMerge = useCallback((primary, secondary) => {
    setSelectedPair({ primary, secondary });
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <DuplicateStats />
          <Button 
            onClick={handleScan} 
            disabled={isScanning} 
            className="gap-2 mt-6 w-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Escaneando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Escanear Duplicatas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {duplicates && (
        <DuplicateResults
          duplicates={duplicates}
          onMerge={handleMerge}
        />
      )}

      {selectedPair && (
        <ContactMergeDialog
          workspaceId={workspaceId}
          primaryContact={selectedPair.primary}
          secondaryContact={selectedPair.secondary}
          onClose={() => setSelectedPair(null)}
          onSuccess={() => {
            setSelectedPair(null);
            handleScan();
          }}
        />
      )}
    </div>
  );
}