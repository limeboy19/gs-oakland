import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';


let authOptions = { suppressAuth: true };

export async function afterInsert_RichContent(item) {
  console.log("afterInsert_RichContent triggered", item);

  const fullItem = await wixData.get("RichContent", item._id, authOptions);

  try {
    await afterInsertRichContent(fullItem);
  } catch (err) {
    console.error("Error in afterInsertRichContent:", err);
  }

  return fullItem;
}

export async function RichContent_afterUpdate(item, context, authOptions) {
  console.log("afterUpdate_RichContent triggered", { data: item });
  await afterUpdateRichContent(fullItem, authOptions);
  
}
