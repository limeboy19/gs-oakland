import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import { log } from 'wix-logging';

let authOptions = { suppressAuth: true };

export async function afterInsert_RichContent(item, context, authOptions) {
  log.info("afterInsert_RichContent triggered", item );
  afterInsertRichContent(fullItem, context, authOptions);

}

export async function afterUpdate_RichContent(item, context, authOptions) {
  log.info("afterUpdate_RichContent triggered", { data: item });
  afterUpdateRichContent(fullItem, context, authOptions);
  
}
