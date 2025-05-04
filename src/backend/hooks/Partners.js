import wixData from 'wix-data';

const authOptions = { suppressAuth: true, suppressHooks: true };

export async function ensureAllCategoryAndUpdate(item) {
  const ALL_CATEGORY_ID = "60b01748-cf88-4079-97a4-15d4afed6729";
  const ids = Array.isArray(item.PartnerCategories_multireference)
    ? item.PartnerCategories_multireference
    : [];

  const updatedIds = Array.from(new Set([...ids, ALL_CATEGORY_ID]));

  const updatedItem = {
    ...item,
    PartnerCategories_multireference: updatedIds
  };

  return wixData.update("CommunityPartners", updatedItem, authOptions);
}
