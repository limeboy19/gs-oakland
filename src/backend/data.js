import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import { log } from 'wix-logging';

const authOptions = { suppressAuth: true };

export async function afterInsert_RichContent(item, context) {
  log.info("afterInsert_RichContent triggered", { data: item });


  const fullItem = await wixData.get("RichContent", item._id, authOptions);
  await afterInsertRichContent(fullItem, context);
  return fullItem;
}

export async function afterUpdate_RichContent(item, context) {
  log.info("afterUpdate_RichContent triggered", { data: item });

  const fullItem = await wixData.get("RichContent", item._id, authOptions);
  await afterUpdateRichContent(fullItem, context);
  return fullItem;
}
