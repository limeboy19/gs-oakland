import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import { log } from 'wix-logging';

let authOptions = { suppressAuth: true };

export async function RichContent_afterInsert(item, context, authOptions) {
  log.info("afterInsert_RichContent triggered", item );
  console.log("are we hitting this?");
  afterInsertRichContent(fullItem, context, authOptions);

}

export async function RichContent_afterUpdate(item, context, authOptions) {
  log.info("afterUpdate_RichContent triggered", { data: item });
  afterUpdateRichContent(fullItem, authOptions);
  
}
