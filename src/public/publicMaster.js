import wixData from "wix-data";

let authOptions = { suppressAuth: true, suppressHooks: true };

export async function getFeaturedMasterHubItems() {
    try {
        const results = await wixData.query("MasterHubAutomated")
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

export async function getFAQ() {
    try {
        const results = await wixData.query("MasterFAQ")
            .find(authOptions);

        return results.items;
    } catch (err) {
        console.error("Error fetching featured MasterHub items:", err);
        return [];
    }
}