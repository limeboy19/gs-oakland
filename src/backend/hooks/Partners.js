import wixData from 'wix-data';

export async function ensureAllCategoryAndUpdate(item) {
  const ALL_CATEGORY_ID = "60b01748-cf88-4079-97a4-15d4afed6729";

 console.log("ITEM ID", item._id);

  // Check if the reference already exists before inserting
  const existingRefs = Array.isArray(item.PartnerCategories_multireference)
    ? item.PartnerCategories_multireference.map(ref => (typeof ref === "object" ? ref._id : ref))
    : [];

  if (!existingRefs.includes(ALL_CATEGORY_ID)) {
    console.log(`📎 Inserting 'ALL' reference for item ${item._id}`);
    await wixData.insertReference("CommunityPartners", item._id, "PartnerCategories_multireference", ALL_CATEGORY_ID);
  } else {
    console.log(`✅ 'ALL' reference already exists for item ${item._id}`);
  }

  return item; // or return updated item if needed
}
