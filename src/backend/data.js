import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';


let authOptions = { suppressAuth: true };

export async function RichContent_afterInsert(item, context, authOptions) {
  console.log("afterInsert_RichContent triggered", item );
  console.log("are we hitting this?");
  afterInsertRichContent(fullItem, context, authOptions);

}

export async function RichContent_afterUpdate(item, context, authOptions) {
  console.log("afterUpdate_RichContent triggered", { data: item });
  afterUpdateRichContent(fullItem, authOptions);
  
}
