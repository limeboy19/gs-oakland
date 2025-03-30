import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';

export function afterInsert_RichContent(item, context) {
  return afterInsertRichContent(item, context);
}

export function afterUpdate_RichContent(item, context) {
  return afterUpdateRichContent(item, context);
}
