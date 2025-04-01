import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import { afterInsertVideo, afterUpdateVideo } from 'backend/hooks/Video.js';
import { syncVideoCategories, syncRichContentCategories } from 'backend/jobs.js';

let authOptions = { suppressAuth: true };

export function RichContent_afterInsert(item, context) {
  console.log("afterInsert_RichContent hook triggered", item);
  //afterInsertRichContent(item);

  if(item?.needsCategorySync == true) {
    //syncRichContentCategories();
 }
  
}

export async function RichContent_afterUpdate(item, context) {
  console.log("afterUpdate_RichContent hook triggered", item);
  //afterUpdateRichContent(item);

  if(item?.needsCategorySync == true) {
    //syncRichContentCategories();
 }
  
}

export function Video_afterInsert(item, context) {
  console.log("afterInsert_Video hook triggered", item);
  //afterInsertVideo(item);

  if(item?.needsCategorySync == true) {
    //syncVideoCategories();
 }
}

export async function Video_afterUpdate(item, context) {
  console.log("afterUpdate_Video hook triggered", item);
  // afterUpdateVideo(item);

   if(item?.needsCategorySync == true) {
     // syncVideoCategories();
   }
}



