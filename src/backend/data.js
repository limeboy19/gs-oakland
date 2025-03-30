import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import { log } from 'wix-logging';

export async function afterInsert_RichContent(item, context) {
  log.info("afterInsert_RichContent triggered", { data: item });
  console.log("afterInsert_RichContent triggered", item);
  await afterInsertRichContent(item, context);
  return item;
}

export async function afterUpdate_RichContent(item, context) {
  log.info("afterUpdate_RichContent triggered", { data: item });
  console.log("afterUpdate_RichContent triggered", item);
  await afterUpdateRichContent(item, context);
  return item;
}
