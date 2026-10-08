import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Merge two contacts:
 * - Keep primary contact
 * - Transfer notes, tags, activities, relationships from secondary to primary
 * - Delete secondary contact
 * - Create activity log
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, primary_contact_id, secondary_contact_id, merged_data } = await req.json();

    if (!workspace_id || !primary_contact_id || !secondary_contact_id) {
      return Response.json({ 
        error: 'workspace_id, primary_contact_id, and secondary_contact_id are required' 
      }, { status: 400 });
    }

    if (primary_contact_id === secondary_contact_id) {
      return Response.json({ error: 'Cannot merge contact with itself' }, { status: 400 });
    }

    // Get both contacts
    const primaryContact = await base44.asServiceRole.entities.Client.get(primary_contact_id);
    const secondaryContact = await base44.asServiceRole.entities.Client.get(secondary_contact_id);

    if (!primaryContact || !secondaryContact) {
      return Response.json({ error: 'One or both contacts not found' }, { status: 404 });
    }

    if (primaryContact.tenant_id !== workspace_id || secondaryContact.tenant_id !== workspace_id) {
      return Response.json({ error: 'Contacts must belong to the specified workspace' }, { status: 403 });
    }

    // Step 1: Update primary contact with merged data
    if (merged_data) {
      await base44.asServiceRole.entities.Client.update(primary_contact_id, merged_data);
    }

    // Step 2: Transfer notes
    const secondaryNotes = await base44.asServiceRole.entities.ContactNote.filter({ 
      contact_id: secondary_contact_id 
    });
    for (const note of secondaryNotes) {
      await base44.asServiceRole.entities.ContactNote.update(note.id, {
        contact_id: primary_contact_id,
      });
    }

    // Step 3: Transfer tag assignments
    const secondaryTagAssignments = await base44.asServiceRole.entities.ContactTagAssignment.filter({ 
      contact_id: secondary_contact_id 
    });
    for (const assignment of secondaryTagAssignments) {
      // Check if tag already assigned to primary
      const existingAssignment = await base44.asServiceRole.entities.ContactTagAssignment.filter({
        contact_id: primary_contact_id,
        tag_id: assignment.tag_id,
      });
      
      if (existingAssignment.length === 0) {
        await base44.asServiceRole.entities.ContactTagAssignment.create({
          workspace_id: assignment.workspace_id,
          contact_id: primary_contact_id,
          tag_id: assignment.tag_id,
        });
      }
      
      // Delete secondary assignment
      await base44.asServiceRole.entities.ContactTagAssignment.delete(assignment.id);
    }

    // Step 4: Transfer activities
    const secondaryActivities = await base44.asServiceRole.entities.ContactActivity.filter({ 
      contact_id: secondary_contact_id 
    });
    for (const activity of secondaryActivities) {
      await base44.asServiceRole.entities.ContactActivity.update(activity.id, {
        contact_id: primary_contact_id,
      });
    }

    // Step 5: Transfer relationships
    const outgoingRelationships = await base44.asServiceRole.entities.ContactRelationship.filter({ 
      contact_id: secondary_contact_id 
    });
    for (const rel of outgoingRelationships) {
      await base44.asServiceRole.entities.ContactRelationship.update(rel.id, {
        contact_id: primary_contact_id,
      });
    }

    const incomingRelationships = await base44.asServiceRole.entities.ContactRelationship.filter({ 
      related_contact_id: secondary_contact_id 
    });
    for (const rel of incomingRelationships) {
      await base44.asServiceRole.entities.ContactRelationship.update(rel.id, {
        related_contact_id: primary_contact_id,
      });
    }

    // Step 6: Create merge activity
    await base44.asServiceRole.entities.ContactActivity.create({
      workspace_id: workspace_id,
      contact_id: primary_contact_id,
      activity_type: 'edit',
      description: `Contato mesclado com ${secondaryContact.company_name}`,
      metadata: {
        merge_operation: true,
        merged_contact_id: secondary_contact_id,
        merged_contact_name: secondaryContact.company_name,
        merged_contact_email: secondaryContact.email,
        notes_transferred: secondaryNotes.length,
        tags_transferred: secondaryTagAssignments.length,
        activities_transferred: secondaryActivities.length,
        relationships_transferred: outgoingRelationships.length + incomingRelationships.length,
      },
    });

    // Step 7: Delete secondary contact
    await base44.asServiceRole.entities.Client.delete(secondary_contact_id);

    return Response.json({
      success: true,
      primary_contact_id,
      secondary_contact_id,
      transfers: {
        notes: secondaryNotes.length,
        tags: secondaryTagAssignments.length,
        activities: secondaryActivities.length,
        relationships: outgoingRelationships.length + incomingRelationships.length,
      },
      message: 'Contacts merged successfully',
    });
  } catch (error) {
    console.error('Error merging contacts:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});