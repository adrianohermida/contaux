import React from 'react';
import RelationshipItem from './RelationshipItem';
import RelationshipsEmpty from './RelationshipsEmpty';

export default function RelationshipsList({
  relationships,
  relatedContacts,
  contactId,
  onDelete,
  onAdd
}) {
  if (relationships.length === 0) {
    return <RelationshipsEmpty onAdd={onAdd} />;
  }

  return (
    <div className="space-y-3">
      {relationships.map((rel) => {
        const isOutgoing = rel.contact_id === contactId;
        const relatedId = isOutgoing ? rel.related_contact_id : rel.contact_id;
        const relatedContact = relatedContacts.find(c => c.id === relatedId);

        return (
          <RelationshipItem
            key={rel.id}
            relationship={rel}
            relatedContact={relatedContact}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}