import wixData from 'wix-data';
import {logError} from 'backend/logging/logFunctions.js';

const authOptions = { suppressAuth: true, suppressHooks: true };
//Need to fix this so it's not hardcoded in all back end functions
const baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';
let secondaryURL;

export async function afterInsertProfessionalProgram(partialItem) {
    try {
      const result = await wixData.query("ProfessionalPrograms")
        .eq("_id", partialItem._id)
        .include("categories")
        .include("ageGroups")
        .find(authOptions);
  
      const item = result.items[0];
      if (!item) {
        console.warn(`Inserted professional program not found for ID: ${partialItem._id}`);
        return partialItem;
      }
      
      secondaryURL = item["link-professional-programs-title"];
      let textURL = baseURL + secondaryURL;
  
      const inserted = await wixData.insert("ProfProgramMasterHubAutomated", {
        title: item.title,
        description: item.description,
        coverImage: item.image,
        resourceType: '33738488-3fcf-4774-a7ca-5edea21fe062',
        link: textURL,
        referenceId: item._id,
        featured: item?.featured
      }, authOptions);
  
      console.log(`Inserted ProfProgramMasterHubAutomated item for Professional Program: ${inserted._id}`);
  
      // Flag for category sync (handled by background job)
      const saveObject = { ...item, needsSync: true };
      await wixData.update("ProfessionalPrograms", saveObject, authOptions);
  
      console.log(`Marked ProfessionalPrograms for category sync: ${item._id}`);
  
    } catch (error) {
      console.error("Error in afterInsertProfessionalPrograms:", error);
      await logError("afterInsert - ProfessionalPrograms", error);
    }
  
    return partialItem;
  }


  export async function afterUpdateProfessionalProgram(partialItem) {
    console.log("afterUpdate triggered for ProfessionalPrograms:", partialItem);
  
    try {
      const professionalProgramResult = await wixData.query("ProfessionalPrograms")
        .eq("_id", partialItem._id)
        .find(authOptions);
  
      const item = professionalProgramResult.items[0];
      if (!item) {
        console.warn(`Professional Program not found for ID: ${partialItem._id}`);
        return partialItem;
      }
  
      secondaryURL = item["link-professional-programs-title"];
      let textURL = baseURL + secondaryURL;
  
      const hubResult = await wixData.query("ProfProgramMasterHubAutomated")
        .eq("referenceId", item._id)
        .limit(1)
        .find(authOptions);
  
      if (hubResult.items.length === 0) {
        console.log(`No ProProgramMasterHubAutomated match for Professional Program ID: ${item._id}`);
        return item;
      }
  
      const masterItem = hubResult.items[0];
  
      await wixData.update("ProfProgramMasterHubAutomated", {
        _id: masterItem._id,
        title: partialItem.title,
        description: item.description,
        coverImage: item.image || null,
        link: textURL,
        resourceType: '33738488-3fcf-4774-a7ca-5edea21fe062',
        referenceId: item._id,
        featured: item?.featured
      }, authOptions);
  
      console.log(`Updated MasterHubAutomated core fields: ${masterItem._id}`);
      
      const saveObject = { ...item, needsSync: true };
      console.log("What are we saving professional programs?", saveObject);
      await wixData.update("ProfessionalPrograms", saveObject, authOptions);
    
  
    } catch (error) {
      console.error("Error in afterUpdateProfessionalPrograms:", error);
      await logError("afterUpdate - ProfessionalPrograms", error);
    }
  
    return partialItem;
  }

  export async function afterDeleteProfessionalProgram(partialItem) {
    console.log("afterDelete triggered for ProfessionalPrograms:", partialItem);
  
    try {
      const hubResult = await wixData.query("ProfProgramMasterHubAutomated")
        .eq("title", partialItem.title)
        .limit(1)
        .find(authOptions);
  
      if (hubResult.items.length === 0) {
        console.log(`No MasterHubAutomated match to delete for Video ID: ${partialItem._id}`);
        return partialItem;
      }
  
      const masterItem = hubResult.items[0];
  
      await wixData.remove("ProfProgramMasterHubAutomated", masterItem._id, authOptions);
      console.log(`Deleted ProfProgramMasterHubAutomated item: ${masterItem._id}`);
  
    } catch (error) {
      console.error("Error in afterDeleteVideo:", error);
      await logError("afterDelete - Video", error);
    }
  
    return partialItem;
  }

    
  //USE THIS TO RUN MASTER SYNC FOR PROFESSIONAL MASTER HUB
  export async function syncAllProfessionalProgramsToMasterHub() {
    try {
      const results = await wixData.query("ProfessionalPrograms")
        .include("categories")
        .include("ageGroups")
        .limit(100)
        .find(authOptions);
  
      for (const item of results.items) {
        const categoryIds = item.categories?.map(c => c._id) || [];
        const ageGroupIds = item.ageGroups?.map(a => a._id) || [];
        const textURL = `${baseURL}/${item["link-professional-programs-title"]}`;
  
        const inserted = await wixData.insert("ProfProgramMasterHubAutomated", {
          title: item.title,
          description: item.description,
          coverImage: item.image,
          link: textURL,
          referenceId: item._id
        }, authOptions);
  
        console.log(`Inserted ProfProgram item: ${item.title} → ${inserted._id}`);
  
        if (categoryIds.length > 0) {
          await wixData.insertReference("ProfProgramMasterHubAutomated", "categories", inserted._id, categoryIds, authOptions);
          console.log(`Inserted category refs for: ${item.title}`);
        }

        if (ageGroupIds.length > 0) {
          await wixData.insertReference("ProfProgramMasterHubAutomated", "ageGroups", inserted._id, ageGroupIds, authOptions);
          console.log(`Inserted ageGroup references for: ${item.title}`);
        }
      }
  
      console.log("ProfProgram sync to ProfProgramMasterHubAutomated complete.");
      return { success: true };
    } catch (error) {
      console.error("Error in syncAllProfessionalProgramsToMasterHub:", error);
      await logError("syncAllProfessionalProgramsToMasterHub", error);
      return { success: false, error: String(error) };
    }
  }
