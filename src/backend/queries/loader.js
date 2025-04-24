import wixData from 'wix-data';

export async function getCategoryTitles() {
  try {
    const results = await wixData.query("Categories")
      .ascending("title")
      .find();

    return results.items.map(item => item.title);
  } catch (err) {
    console.error("Error fetching category titles:", err);
    throw new Error("Failed to load category titles");
  }
}

export async function getLanguages() {
  try {
    const results = await wixData.query("Languages")
      .ascending("title")
      .find();

    return results.items.map(item => item.title);
  } catch (err) {
    console.error("Error fetching language titles:", err);
    throw new Error("Failed to load category titles");
  }
}
