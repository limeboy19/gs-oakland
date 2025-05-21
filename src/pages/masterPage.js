import { getFeaturedMasterHubItems, getFAQ } from 'public/publicMaster.js';
import wixLocation from 'wix-location';

$w.onReady(async function () {
    const currentPath = wixLocation.path.join("/");
    console.log("Current path:", currentPath);

    try{

     if($w("#accordianRpt").rendered) {
        console.log('FAQ repeater found');
        const FAQ = await getFAQ();
        //console.log("Emil testing FAQ", FAQ);
        $w("#accordianRpt").data = FAQ;

        $w("#accordianRpt").onItemReady(($item, itemData) => {

            $item("#accordianRptPlus").onClick(() => {
                const textBox = $item("#accordianRptTxt");
                const textTitleButton = $item("#accordianRptBtn");

                if (textBox.collapsed) {
                    textTitleButton.style.color = "#009cdd";
                    textBox.expand();
                    $item("#accordianRptPlus").text = "-";
                } else {
                    textTitleButton.style.color = "#4a4848";
                    textBox.collapse();
                    $item("#accordianRptPlus").text = "+";
                }
                
            });

            $item("#accordianRptTitle").text = itemData.title;
            $item("#accordianRptTxt").text = itemData.answers;

            $item("#accordianRptBtn").onClick(() => {
                const textBox = $item("#accordianRptTxt");
                const textTitleButton = $item("#accordianRptBtn");

                if (textBox.collapsed) {
                    textTitleButton.style.color = "#009cdd";
                    textBox.expand();
                    $item("#accordianRptPlus").text = "-";
                } else {
                    textTitleButton.style.color = "#4a4848";
                    textBox.collapse();
                    $item("#accordianRptPlus").text = "+";
                }
            });
        });
    }
    } catch (err) {
        console.error("Error rendering FAQ repeater", err);
    }


    try {
        if  ($w("#repeaterMaster").rendered) {
            console.log('MasterHub repeater found');
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


        }
    } catch (err) {
        console.error("Error rendering master repeater", err);
    }
});

function truncateToNearestWord(text, maxLength) {
    if (text.length <= maxLength) return text;
    let cutoffIndex = text.lastIndexOf(' ', maxLength);
    let truncated = text.substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength).trim();
    truncated = truncated.replace(/[.,;:]$/, '');
    return truncated + '...';
}