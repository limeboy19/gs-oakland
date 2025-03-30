import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';


let authOptions = { suppressAuth: true };

export function RichContent_afterInsert(item, context) {
  console.log("Emil testing");
  console.log("afterInsert_RichContent triggered", item);
  afterInsertRichContent(item,authOptions);
  
}

export async function RichContent_afterUpdate(item, context) {
  console.log("afterUpdate_RichContent triggered", { data: item });
  await afterUpdateRichContent(fullItem, authOptions);
  
}
