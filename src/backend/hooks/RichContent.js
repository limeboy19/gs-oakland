import wixData from 'wix-data';

const baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';
const authOptions = { suppressAuth: true };

export async function afterUpdateRichContent(partialItem) {
  console.log("afterUpdate triggered for RichContent:", partialItem);

  try {
    // Step 1: Get full RichContent item with categories
    const richContentResult = await wixData.query("RichContent")
      .eq("_id", partialItem._id)
      .include("categories")
      .find(authOptions);

    const item = richContentResult.items[0];
    const categoryIds = item.categories.map(c => c._id);
    const textURL = `${baseURL}/${item["link-rich-content-title"]}`;

    // Step 2: Find corresponding MasterHubAutomated record
    const hubResult = await wixData.query("MasterHubAutomated")
      .eq("referenceId", item._id)
      .limit(1)
      .find(authOptions);

    if (hubResult.items.length === 0) {
      console.log(`No matching item found in MasterHubAutomated for referenceId: ${item._id}`);
      return item;
    }

    const masterItem = hubResult.items[0];

    // Step 3: Update main fields
    const updatedFields = {
      _id: masterItem._id,
      title: item.title,
      description: item.description,
      coverImage: item.image,
      link: textURL,
      referenceId: item._id
    };

    await wixData.update("MasterHubAutomated", updatedFields, authOptions);
    console.log(`Updated MasterHubAutomated item with ID: ${masterItem._id}`);

    if (categoryIds.length > 0) {
      await wixData.replaceReferences(
        "MasterHubAutomated",
        "categories",
        masterItem._id,
        categoryIds,
        authOptions
      );
      console.log(`Replaced category references for item: ${masterItem._id}`);
    }

  } catch (error) {
    console.error("Error in afterUpdateRichContent:", error);
    await logError("afterUpdate - RichContent", error);
  }

  return partialItem;
}



export async function afterInsertRichContent(partialItem) {
  try {
    const result = await wixData.query("RichContent")
      .eq("_id", partialItem._id)
      .include("categories")
      .find(authOptions);

    const item = result.items[0];
    console.log("Final item?", item);

    const categoryIds = item.categories.map(c => c._id);
    const textURL = `${baseURL}/${item["link-rich-content-title"]}`;

    // Step 1: Insert item (without multi-ref)
    const inserted = await wixData.insert("MasterHubAutomated", {
      title: item.title,
      description: item.description,
      coverImage: item.image,
      link: textURL,
      referenceId: item._id
    }, authOptions);

    console.log(`Inserted MasterHubAutomated item: ${inserted._id}`);

    if (categoryIds.length > 0) {
      await wixData.insertReference(
        "MasterHubAutomated",
        "categories",
        inserted._id,
        categoryIds,
        authOptions
      );
      console.log(`Inserted category references for item: ${inserted._id}`);
    }
    

  } catch (error) {
    console.error("Error in afterInsertRichContent:", error);
    await logError("afterInsert - RichContent", error);
  }

  return partialItem;
}

  
async function logError(location, error) {
  const now = new Date();
  const logEntry = {
    title: error.message || String(error),
    errorOgLocation: location,
    dateOfError: new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })),
    timeOfError: now.toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
    errorObject: error
  };

  try {
    await wixData.insert("logs", logEntry, authOptions);
  } catch (logError) {
    console.error("Failed to log error to logs collection:", logError);
  }
}

//USE THIS TO TEST AN INSERT VIA CODE
export async function testAfterInsert() {
  const fakeItem = {
    title: "Sample Test Title",
    categories: ["Education"],
    resourceType: "Video",
    description: "This is a test insert.",
    "link-rich-content-title": "test-content-title",
    _id: "test-id-123"
  };

  const result = await afterInsertRichContent(fakeItem, {});
  return result;
}

//USE THIS TO SYNC IF NEEDED//
export async function syncAllRichContentToMasterHub() {
  try {
    const pageSize = 100; // adjust if needed
    let results = await wixData.query("RichContent")
      .include("categories")
      .limit(pageSize)
      .find(authOptions);

    const items = results.items;

    for (const item of items) {
      const categoryIds = item.categories?.map(c => c._id) || [];
      const textURL = `${baseURL}/${item["link-rich-content-title"]}`;

      // Step 1: Insert item without multi-ref
      const inserted = await wixData.insert("MasterHubAutomated", {
        title: item.title,
        description: item.description,
        coverImage: item.image,
        link: textURL,
        referenceId: item._id
      }, authOptions);

      console.log(`Inserted MasterHubAutomated item for "${item.title}" → ${inserted._id}`);

      // Step 2: Add references
      if (categoryIds.length > 0) {
        await wixData.insertReference("MasterHubAutomated", "categories", inserted._id, categoryIds, authOptions);
        console.log(`Inserted category references for: ${item.title}`);
      }
    }

    console.log("Sync complete for all RichContent items.");
    return { success: true };

  } catch (error) {
    console.error(" Error in syncAllRichContentToMasterHub:", error);
    await logError("syncAllRichContentToMasterHub", error);
    return { success: false, error: String(error) };
  }
}
