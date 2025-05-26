import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent, afterDeleteRichContent } from 'backend/hooks/RichContent.js';
import { afterInsertVideo, afterUpdateVideo, afterDeleteVideo } from 'backend/hooks/Video.js';
import { afterInsertProfessionalProgram, afterUpdateProfessionalProgram, afterDeleteProfessionalProgram } from 'backend/hooks/ProfessionalProgramsItem.js';
import { afterInsertProfessionalsGetStarted, afterUpdateProfessionalsGetStarted, afterDeleteProfessionalsGetStarted } from 'backend/hooks/ProfessionalGetStarted.js';
import { syncVideoCategories, syncRichContentCategories, syncProfessionalsGetStartedCategories, syncProfessionalProgramCategories } from 'backend/jobs.js';
import { ensureAllCategoryAndUpdate } from 'backend/hooks/Partners.js';

let authOptions = { suppressAuth: true, suppressHooks: true };

//RICH CONTENT
export function RichContent_afterInsert(item, context) {
  console.log("afterInsert_RichContent hook triggered", item);
  afterInsertRichContent(item);
}

export async function RichContent_afterUpdate(item, context) {
  console.log("afterUpdate_RichContent hook triggered", item);
  await afterUpdateRichContent(item);

  if(item?.needsCategorySync == true) {
    syncRichContentCategories();
 }
  
}

export async function RichContent_afterRemove(item, context) {
  console.log("afterDelete_RichContent hook triggered", item);
  await afterDeleteRichContent(item);
}

//VIDEO
export function Video_afterInsert(item, context) {
  console.log("afterRemove_Video hook triggered", item);
  afterInsertVideo(item);

}

export async function Video_afterUpdate(item, context) {
  console.log("afterUpdate_Video hook triggered", item);
  await afterUpdateVideo(item);

   if(item?.needsCategorySync == true) {
     syncVideoCategories();
   }
}

export async function Video_afterRemove(item, context) {
  console.log("afterRemove_Video hook triggered", item);
  await afterDeleteVideo(item);
  
}

//Partner Categories
export async function CommunityPartners_afterInsert(item, context) {
  console.log("afterInsert_CommunityPartners hook triggered", item);
  await ensureAllCategoryAndUpdate(item);
}

export async function CommunityPartners_afterUpdate(item, context) {
  console.log("afterUpdate_CommunityPartners hook triggered", item);
  await ensureAllCategoryAndUpdate(item);
}

//Professional Programs
export function ProfessionalPrograms_afterInsert(item, context) {
  console.log("afterInsert_ProfessionalPrograms hook triggered", item);
  afterInsertProfessionalProgram(item);
}

export async function ProfessionalPrograms_afterUpdate(item, context) {
  console.log("afterUpdate_ProfessionalPrograms hook triggered", item);
  await afterUpdateProfessionalProgram(item);

  if (item?.needsSync == true) {
    syncProfessionalProgramCategories();
  }
}

export async function ProfessionalPrograms_afterRemove(item, context) {
  console.log("afterRemove_ProfessionalPrograms hook triggered", item);
  await afterDeleteProfessionalProgram(item);
}


//Professional Get Started
export function ProfessionalsGetStarted_afterInsert(item, context) {
  console.log("afterInsert_ProfessionalsGetStarted hook triggered", item);
  afterInsertProfessionalsGetStarted(item);
}

export async function ProfessionalsGetStarted_afterUpdate(item, context) {
  console.log("afterUpdate_ProfessionalsGetStarted hook triggered", item);
  await afterUpdateProfessionalsGetStarted(item);

  if (item?.needsSync == true) {
    syncProfessionalsGetStartedCategories();
  }
}

export async function ProfessionalsGetStarted_afterRemove(item, context) {
  console.log("afterRemove_ProfessionalsGetStarted hook triggered", item);
  await afterDeleteProfessionalsGetStarted(item);
}