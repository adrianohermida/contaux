import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function ContactTagSelector({ contactId, workspaceId }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: allTags = [] } = useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: async () => {
      return await base44.entities.ContactTag.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['contact-tag-assignments', contactId],
    queryFn: async () => {
      return await base44.entities.ContactTagAssignment.filter({ contact_id: contactId });
    },
    enabled: !!contactId,
  });

  const assignedTagIds = assignments.map(a => a.tag_id);
  const assignedTags = allTags.filter(t => assignedTagIds.includes(t.id));
  const availableTags = allTags.filter(t => !assignedTagIds.includes(t.id));

  const addTagMutation = useMutation({
    mutationFn: async (tagId) => {
      const assignment = await base44.entities.ContactTagAssignment.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        tag_id: tagId,
      });
      
      // Create activity log
      const tag = allTags.find(t => t.id === tagId);
      await base44.entities.ContactActivity.create({
        workspace_id: workspaceId,
        contact_id: contactId,
        activity_type: 'tag_added',
        description: `Tag adicionada: ${tag?.name || 'Tag'}`,
        metadata: { tag_id: tagId, tag_name: tag?.name },
      });
      
      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tag-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
      updateTagCount();
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId) => {
      const assignment = assignments.find(a => a.tag_id === tagId);
      if (assignment) {
        const tag = allTags.find(t => t.id === tagId);
        
        await base44.entities.ContactTagAssignment.delete(assignment.id);
        
        // Create activity log
        await base44.entities.ContactActivity.create({
          workspace_id: workspaceId,
          contact_id: contactId,
          activity_type: 'tag_removed',
          description: `Tag removida: ${tag?.name || 'Tag'}`,
          metadata: { tag_id: tagId, tag_name: tag?.name },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tag-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['contact-activities'] });
      updateTagCount();
    },
  });

  const updateTagCount = () => {
    // Trigger recount (in production, this would be a backend trigger)
    queryClient.invalidateQueries({ queryKey: ['contact-tags'] });
  };

  const handleAddTag = (tagId) => {
    addTagMutation.mutate(tagId);
    setOpen(false);
  };

  const handleRemoveTag = (tagId) => {
    removeTagMutation.mutate(tagId);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {assignedTags.map((tag) => (
        <span
          key={tag.id}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="hover:opacity-70"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          {availableTags.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-2">
              Todas as tags foram atribuídas
            </p>
          ) : (
            <div className="space-y-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border hover:opacity-80 transition-opacity ${TAG_COLORS[tag.color] || TAG_COLORS.blue}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}