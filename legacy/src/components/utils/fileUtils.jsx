/**
 * File utility functions for attachment handling
 */

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
}

export function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    // Documents
    pdf: 'FileText',
    doc: 'FileText',
    docx: 'FileText',
    txt: 'FileText',
    
    // Spreadsheets
    xls: 'Table',
    xlsx: 'Table',
    csv: 'Table',
    
    // Images
    jpg: 'Image',
    jpeg: 'Image',
    png: 'Image',
    gif: 'Image',
    svg: 'Image',
    
    // Archives
    zip: 'Archive',
    rar: 'Archive',
    '7z': 'Archive',
    tar: 'Archive',
    gz: 'Archive',
    
    // Code
    js: 'Code',
    ts: 'Code',
    json: 'Code',
    xml: 'Code',
    html: 'Code',
    css: 'Code',
  };
  
  return iconMap[ext] || 'File';
}

export function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const mimeMap = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    zip: 'application/zip',
  };
  
  return mimeMap[ext] || 'application/octet-stream';
}

export function isPreviewable(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
}