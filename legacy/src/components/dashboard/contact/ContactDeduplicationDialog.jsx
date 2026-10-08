/**
 * Contact Deduplication Dialog
 * Complete deduplication interface
 */

import React, { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import DuplicateDetector from './DuplicateDetector';
import DuplicateMergePreview from './DuplicateMergePreview';

export default function ContactDeduplicationDialog({ open, onClose, workspaceId }) {
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [showMergePreview, setShowMergePreview] = useState(false);

  const handleSelectDuplicate = (duplicate) => {
    setSelectedDuplicate(duplicate);
    setShowMergePreview(true);
  };

  const handleMergeSuccess = () => {
    setSelectedDuplicate(null);
    setShowMergePreview(false);
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <SearchCheck className="w-5 h-5" aria-hidden="true" />
              Detectar Duplicatas
            </AlertDialogTitle>
            <AlertDialogDescription>
              Use fuzzy matching para encontrar contatos duplicados e mescle-os inteligentemente
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <DuplicateDetector
              workspaceId={workspaceId}
              onSelectDuplicate={handleSelectDuplicate}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Preview Dialog */}
      <DuplicateMergePreview
        open={showMergePreview}
        onClose={() => setShowMergePreview(false)}
        duplicate={selectedDuplicate}
        onMergeSuccess={handleMergeSuccess}
      />
    </>
  );
}