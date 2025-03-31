import wixData from 'wix-data';

const baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';
const authOptions = { suppressAuth: true };

export async function afterInsertVideo(partialItem) {
    try {
      const result = await wixData.query("Video")
        .eq("_id", partialItem._id)
        .include("categories")
        .find(authOptions);
  
      const item = result.items[0];
      const categoryIds = item.categories.map(c => c._id);
      const textURL = `${baseURL}/${item["link-video-title"]}`;
  
      const inserted = await wixData.insert("MasterHubAutomated", {
        title: item.title,
        description: item.description,
        coverImage: item.coverImage,
        link: textURL,
        referenceId: item._id
      }, authOptions);
  
      console.log(`Inserted MasterHubAutomated item for Video: ${inserted._id}`);
  
      if (categoryIds.length > 0) {
        await wixData.insertReference("MasterHubAutomated", "categories", inserted._id, categoryIds, authOptions);
        console.log(`Inserted category references for Video: ${item.title}`);
      }
  
    } catch (error) {
      console.error("Error in afterInsertVideo:", error);
      await logError("afterInsert - Video", error);
    }
  
    return partialItem;
  }

  export async function afterUpdateVideo(partialItem) {
    console.log("afterUpdate triggered for Video:", partialItem);
  
    try {
      // Step 1: Get full Video item with categories
      const result = await wixData.query("Video")
        .eq("_id", partialItem._id)
        .include("categories")
        .limit(1)
        .find(authOptions);
  
      const item = result.items[0] || {};
      const categories = Array.isArray(item.categories) ? item.categories : [];
      const categoryIds = categories.map(c => c._id).filter(Boolean);
      const textURL = `${baseURL}/${item["link-video-title"] || ""}`;
  
      // Step 2: Find corresponding MasterHubAutomated record
      const hubResult = await wixData.query("MasterHubAutomated")
        .eq("referenceId", item._id)
        .limit(1)
        .find(authOptions);
  
      if (hubResult.items.length === 0) {
        console.log(`No matching MasterHubAutomated item found for Video ID: ${item._id}`);
        return item;
      }
  
      const masterItem = hubResult.items[0];
  
      // Step 3: Update main fields
      const updatedFields = {
        _id: masterItem._id,
        title: item.title || "",
        description: item.description || "",
        coverImage: item.coverImage || null,
        link: textURL,
        referenceId: item._id
      };
  
      await wixData.update("MasterHubAutomated", updatedFields, authOptions);
      console.log(`Updated MasterHubAutomated item: ${masterItem._id}`);
  
      await new Promise((res) => setTimeout(res, 300)); // allow commit to finish
  
      // Step 4: Replace category references
      await wixData.replaceReferences(
        "MasterHubAutomated",
        "categories",
        masterItem._id,
        categoryIds,
        authOptions
      );
      console.log(`Replaced category references for Video: ${item.title}`);
  
    } catch (error) {
      console.error("Error in afterUpdateVideo:", error);
      await logError("afterUpdate - Video", error);
    }
  
    return partialItem;
  }
  
  

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
  