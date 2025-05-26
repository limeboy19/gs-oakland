import wixData from 'wix-data';
import {logError} from 'backend/logging/logFunctions.js';

const authOptions = { suppressAuth: true, suppressHooks: true };
//Need to fix this so it's not hardcoded in all back end functions
const baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';
let secondaryURL;

export async function afterInsertProfessionalsGetStarted(partialItem) {
    try {
      const result = await wixData.query("ProfessionalsGetStarted")
        .eq("_id", partialItem._id)
        .include("categories")
        .include("ageGroups")
        .find(authOptions);
  
      const item = result.items[0];
      if (!item) {
        console.warn(`Inserted professional get started not found for ID: ${partialItem._id}`);
        return partialItem;
      }
      
      secondaryURL = item["link-professional-programs-title"];
      let textURL = baseURL + secondaryURL;
  
      const inserted = await wixData.insert("ProfProgramMasterHubAutomated", {
        title: item.title,
        description: item.description,
        coverImage: item.image,
        resourceType: '8d1c0749-2983-4aa4-b2c5-d666c18215ad',
        link: textURL,
        referenceId: item._id,
        featured: item?.featured
      }, authOptions);
  
      console.log(`Inserted ProfProgramMasterHubAutomated item for professional get started: ${inserted._id}`);
  
      // Flag for category sync (handled by background job)
      const saveObject = { ...item, needsSync: true };
      await wixData.update("ProfessionalsGetStarted", saveObject, authOptions);
  
      console.log(`Marked ProfessionalsGetStarted for category sync: ${item._id}`);
  
    } catch (error) {
      console.error("Error in afterInsertProfessionalsGetStarted:", error);
      await logError("afterInsert - ProfessionalsGetStarted", error);
    }
  
    return partialItem;
  }


  export async function afterUpdateProfessionalsGetStarted(partialItem) {
    console.log("afterUpdate triggered for ProfessionalsGetStarted:", partialItem);
  
    try {
      const professionalProgramResult = await wixData.query("ProfessionalsGetStarted")
        .eq("_id", partialItem._id)
        .find(authOptions);
  
      const item = professionalProgramResult.items[0];
      if (!item) {
        console.warn(`Professional get started not found for ID: ${partialItem._id}`);
        return partialItem;
      }
  
      secondaryURL = item["link-professional-programs-title"];
      let textURL = baseURL + secondaryURL;
  
      const hubResult = await wixData.query("ProfProgramMasterHubAutomated")
        .eq("referenceId", item._id)
        .limit(1)
        .find(authOptions);
  
      if (hubResult.items.length === 0) {
        console.log(`No ProgramMasterHubAutomated match for professional get started ID: ${item._id}`);
        return item;
      }
  
      const masterItem = hubResult.items[0];
  
      await wixData.update("ProfProgramMasterHubAutomated", {
        _id: masterItem._id,
        title: partialItem.title,
        description: item.description,
        coverImage: item.image || null,
        link: textURL,
        resourceType: '8d1c0749-2983-4aa4-b2c5-d666c18215ad',
        referenceId: item._id
      }, authOptions);
  
      console.log(`Updated MasterHubAutomated core fields: ${masterItem._id}`);
      
      const saveObject = { ...item, needsSync: true };
      console.log("What are we saving professional get started?", saveObject);
      await wixData.update("ProfessionalsGetStarted", saveObject, authOptions);
    
  
    } catch (error) {
      console.error("Error in afterUpdateProfessionalsGetStarted:", error);
      await logError("afterUpdate - ProfessionalsGetStarted", error);
    }
  
    return partialItem;
  }

  export async function afterDeleteProfessionalsGetStarted(partialItem) {
    console.log("afterDelete triggered for ProfessionalsGetStarted:", partialItem);
  
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
  export async function syncAllProfessionalsGetStartedToMasterHub() {
    try {
      const results = await wixData.query("ProfessionalsGetStarted")
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
      console.error("Error in syncAllProfessionalsGetStartedlToMasterHub:", error);
      await logError("syncAllProfessionalsGetStartedToMasterHub", error);
      return { success: false, error: String(error) };
    }
  }