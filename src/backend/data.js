import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';

export async function afterInsert_RichContent(item, context) {
  console.log("afterInsert_RichContent triggered", item);
  await afterInsertRichContent(item, context);
  return item;
}

export async function afterUpdate_RichContent(item, context) {
  console.log("afterUpdate_RichContent triggered", item);
  await afterUpdateRichContent(item, context);
  return item;
}
