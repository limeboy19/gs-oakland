import wixData from 'wix-data';

let authOptions = { suppressAuth: true, suppressHooks: true };

export async function MasterHubCategories() {
  try {
    const result = await wixData.query("MasterHubAutomated")
      .include("categories")
      .find();
    console.log("✅ Backend: Query success", result.items.length);
    return result;
  } catch (err) {
    console.error("❌ Backend error:", err);
    throw err;
  }
}

export async function getFeaturedMasterHubItems() {
  try {
    const results = await wixData.query("MasterHub")
      .eq("featured", true)
      .include("ageGroups")
      .include("resourceType")
      .include("categories")
      .find(authOptions);

    return results.items;
  } catch (err) {
    console.error("Error fetching featured MasterHub items:", err);
    return [];
  }
}
