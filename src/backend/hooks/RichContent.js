import wixData from 'wix-data';

const baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';
const authOptions = { suppressAuth: true };

export async function afterUpdateRichContent(item) {
  console.log("afterUpdate triggered for RichContent:", item);

  try {
    
    const result = await wixData.query("MasterHubAutomated")
      .eq("title", item.title)
      .limit(1)
      .suppressAuth()
      .find();

    if (result.items.length === 0) {
      console.log(`No matching item found in MasterHubAutomated for title: ${item.title}`);
      return item;
    }

    const masterItem = result.items[0];
    const textURL = baseURL + item["link-rich-content-title"];

    const updatedFields = {
      _id: masterItem?._id,
      categories: item?.categories,
      resourceType: item?.resourceType,
      description: item?.description,
      link: textURL,
      referenceId: item?._id
    };

    await wixData.update("MasterHubAutomated", updatedFields, authOptions);
    console.log(`Updated MasterHubAutomated item with ID: ${masterItem._id}`);

  } catch (error) {
    console.error("Error in afterUpdate hook:", error);
    await logError("afterUpdate - RichContent", error);
  }

  return item;
}


export async function afterInsertRichContent(partialItem) {
  try {
    const result = await wixData.query("RichContent")
      .eq("_id", partialItem._id)
      .include("categories")
      .find(authOptions);

    const item = result.items[0];
    console.log("Final item?", item);

    const textURL = `${baseURL}/${item["link-rich-content-title"]}`;

    const syncedFields = {
      title: item.title,
      categories: item.categories,
      description: item.description,
      link: textURL,
      referenceId: item._id
    };

    await wixData.insert("MasterHubAutomated", syncedFields, authOptions);
    console.log(`✅ Inserted into MasterHubAutomated with full reference IDs`);
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
