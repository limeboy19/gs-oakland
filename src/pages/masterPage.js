import { getFeaturedMasterHubItems, getFAQ } from 'public/publicMaster.js';
import wixLocation from 'wix-location';

let hasRun = false;

$w.onReady(async function () {
    if (hasRun) return;
    hasRun = true;

    const currentPath = wixLocation.path.join("/"); // home page = ""
    console.log("Current path:", currentPath);

    try {
        if (currentPath === "") {
            const MasterHubItems = await getFeaturedMasterHubItems();
            //console.log("Emil testing MasterHubItems", MasterHubItems);

            $w("#repeaterMaster").data = MasterHubItems;

            $w("#repeaterMaster").onItemReady(($item, itemData) => {
                $item("#txtItemTitle").text = itemData.title;
                $item("#imageRepeaterItem").src = itemData.coverImage;
                $item("#txtRepeaterDescription").text = truncateToNearestWord(itemData.description, 105);
                $item("#btnMaster").link = itemData.link;

                const tagOptions = (itemData?.categories || []).map(cat => ({
                    label: cat.title,
                    value: cat._id
                }));

                $item("#selectionTagsMaster").options = tagOptions;
                if (tagOptions.length > 0) {
                    $item("#selectionTagsMaster").expand();
                }

                $item("#txtReadMore").onClick(() => {
                    wixLocation.to(itemData.link);
                });
            });

            const FAQ = await getFAQ();
            //console.log("Emil testing FAQ", FAQ);

            $w("#accordianRpt").data = FAQ;

            $w("#accordianRpt").onItemReady(($item, itemData) => {
                $item("#accordianRptTitle").text = itemData.title;
                $item("#accordianRptTxt").text = itemData.answers;

                $item("#accordianRptBtn").onClick(() => {
                    const textBox = $item("#accordianRptTxt");
                    textBox.collapsed ? textBox.expand() : textBox.collapse();
                });
            });
        }
    } catch (err) {
        console.error("Error rendering data", err);
    }
});

function truncateToNearestWord(text, maxLength) {
    if (text.length <= maxLength) return text;
    let cutoffIndex = text.lastIndexOf(' ', maxLength);
    let truncated = text.substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength).trim();
    truncated = truncated.replace(/[.,;:]$/, '');
    return truncated + '...';
}