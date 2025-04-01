import wixData from 'wix-data';
import {logError} from 'backend/logging/logFunctions.js';

const authOptions = { suppressAuth: true, suppressHooks: true };
const baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';
let secondaryURL;

export async function afterInsertVideo(partialItem) {
    try {
      const result = await wixData.query("Video")
        .eq("_id", partialItem._id)
        .include("categories")
        .find(authOptions);
  
      const item = result.items[0];
      if (!item) {
        console.warn(`Inserted video not found for ID: ${partialItem._id}`);
        return partialItem;
      }
      
      secondaryURL = item["link-video-title"];
      let textURL = baseURL + secondaryURL;
  
      const inserted = await wixData.insert("MasterHubAutomated", {
        title: item.title,
        description: item.description,
        coverImage: item.coverImage,
        resourceType: 'd3008b3f-b2d5-45fa-890f-d21a2cfaaa70',
        link: textURL,
        referenceId: item._id
      }, authOptions);
  
      console.log(`Inserted MasterHubAutomated item for Video: ${inserted._id}`);
  
      // Flag for category sync (handled by background job)
      const saveObject = { ...item, needsCategorySync: true };
      await wixData.save("RichContent", saveObject, authOptions);
  
      console.log(`Marked Video for category sync: ${item._id}`);
  
    } catch (error) {
      console.error("Error in afterInsertVideo:", error);
      await logError("afterInsert - Video", error);
    }
  
    return partialItem;
  }


  export async function afterUpdateVideo(partialItem) {
    console.log("afterUpdate triggered for Video:", partialItem);
  
    try {
      const videoResult = await wixData.query("Video")
        .eq("_id", partialItem._id)
        .find(authOptions);
  
      const item = videoResult.items[0];
      if (!item) {
        console.warn(`Video not found for ID: ${partialItem._id}`);
        return partialItem;
      }
  
      secondaryURL = item["link-video-title"];
      let textURL = baseURL + secondaryURL;
  
      const hubResult = await wixData.query("MasterHubAutomated")
        .eq("referenceId", item._id)
        .limit(1)
        .find(authOptions);
  
      if (hubResult.items.length === 0) {
        console.log(`No MasterHubAutomated match for Video ID: ${item._id}`);
        return item;
      }
  
      const masterItem = hubResult.items[0];
  
      await wixData.update("MasterHubAutomated", {
        _id: masterItem._id,
        title: partialItem.title,
        description: item.description,
        coverImage: item.coverImage || null,
        link: textURL,
        resourceType: 'd3008b3f-b2d5-45fa-890f-d21a2cfaaa70',
        referenceId: item._id
      }, authOptions);
  
      console.log(`Updated MasterHubAutomated core fields: ${masterItem._id}`);
      

      const saveObject = { ...item, needsCategorySync: true };
      await wixData.save("RichContent", saveObject, authOptions);
    
  
    } catch (error) {
      console.error("Error in afterUpdateVideo:", error);
      await logError("afterUpdate - Video", error);
    }
  
    return partialItem;
  }
    

  //USE THIS TO RUN MASTER SYNC
  export async function syncAllVideosToMasterHub() {
    try {
      const results = await wixData.query("Video")
        .include("categories")
        .limit(100)
        .find(authOptions);
  
      for (const item of results.items) {
        const categoryIds = item.categories?.map(c => c._id) || [];
        const textURL = `${baseURL}/${item["link-video-title"]}`;
  
        const inserted = await wixData.insert("MasterHubAutomated", {
          title: item.title,
          description: item.description,
          coverImage: item.coverImage,
          link: textURL,
          referenceId: item._id
        }, authOptions);
  
        console.log(`Inserted Video item: ${item.title} → ${inserted._id}`);
  
        if (categoryIds.length > 0) {
          await wixData.insertReference("MasterHubAutomated", "categories", inserted._id, categoryIds, authOptions);
          console.log(`Inserted category refs for: ${item.title}`);
        }
      }
  
      console.log("Video sync to MasterHubAutomated complete.");
      return { success: true };
    } catch (error) {
      console.error("Error in syncAllVideosToMasterHub:", error);
      await logError("syncAllVideosToMasterHub", error);
      return { success: false, error: String(error) };
    }
  }
  