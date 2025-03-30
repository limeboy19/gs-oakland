import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';

export function afterInsert_RichContent(item, context) {
  console.log("ITEM", item);
  return afterInsertRichContent(item, context);
}

export function afterUpdate_RichContent(item, context) {
  return afterUpdateRichContent(item, context);
}
