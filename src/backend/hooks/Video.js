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
        resourceType: 'd3008b3f-b2d5-45fa-890f-d21a2cfaaa70',
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
    const videoResult = await wixData.query("Video")
      .eq("_id", partialItem._id)
      .include("categories")
      .find(authOptions);

    const item = videoResult.items[0];
    if (!item) {
      console.warn(`Video not found for ID: ${partialItem._id}`);
      return partialItem;
    }

    const categoryIds = (item.categories || []).map(c => (typeof c === 'object' ? c._id : c));
    console.log("Category IDs:", categoryIds);

    const textURL = `${baseURL}/${item["link-video-title"] || ""}`;

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
      title: item.title || "",
      description: item.description,
      coverImage: item.coverImage || null,
      link: textURL,
      resourceType: 'd3008b3f-b2d5-45fa-890f-d21a2cfaaa70',
      referenceId: item._id
    }, authOptions);

    console.log(`Updated MasterHubAutomated: ${masterItem._id}`);

    await new Promise(res => setTimeout(res, 300));

    await wixData.replaceReferences(
      "MasterHubAutomated",
      "categories",
      masterItem._id,
      categoryIds,
      authOptions
    );
    console.log(`Updated categories for: ${item.title}`);

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
  