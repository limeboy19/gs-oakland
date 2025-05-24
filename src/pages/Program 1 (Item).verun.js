//Wix
import wixLocation from 'wix-location';
import wixData from 'wix-data';

//Helper functions
import { handleNext, handleBack } from 'public/arrows.web.js';

$w.onReady(async function () {

    const fullUrl = wixLocation.url;
    console.log("Full URL:", fullUrl);

    const currentItem = $w("#dsPrograms").getCurrentItem();
    const programId = currentItem._id;

    let fullItem;

    try {
        const { items } = await wixData.query("Programs")
            .eq("_id", programId)
            .include("ProgramFAQ_programs")
            .include("HowWeSupportYourFamily_programs")
            .include("Showcase_programs")
            .find();

        fullItem = items[0];
        //console.log("Full item with multi-ref fields:", fullItem);
    } catch (error) {
        console.error("Error querying multi-ref fields:", error);
    }

    if (fullItem?.ProgramFAQ_programs?.length < 1) {
        $w("#sectionFAQ").collapse();
        $w("#sectionFAQ2").collapse();
        
    }

    if (fullItem?.HowWeSupportYourFamily_programs?.length < 1) {
        $w("#sectionVideo").collapse();
    }

    if (fullItem?.Showcase_programs?.length < 1) {
        $w("#sectionTestimonials").collapse();
    }

    if(!fullItem?.getInTouchLink){
        $w("#btnGetInTouch").collapse();
    }

    $w("#repeaterQuestions").onItemReady(($item, itemData) => {
        const textBox = $item("#repeaterAnswer");
        const textTitleButton = $item("#btnRepeaterHideShow");
        const iconButton = $item("#btnRepeaterPlus");

        function toggleAnswerBox() {
            if (textBox.collapsed) {
                textBox.expand();
                textTitleButton.style.color = "#009cdd";
                iconButton.style.color = "#009cdd";
                iconButton.text = "-";
            } else {
                textBox.collapse();
                textTitleButton.style.color = "#4a4848";
                iconButton.style.color = "#4a4848";
                iconButton.text = "+";
            }
        }

        $item("#btnRepeaterPlus").onClick(toggleAnswerBox);
        $item("#btnRepeaterHideShow").onClick(toggleAnswerBox);
    });

    $w("#dsHowWeSupportYourFamily").onReady(async () => {
        let items = $w('#repeaterVideoGallery').data
        let itemCount = items.length;

        if(itemCount === 0 || !itemCount){
            $w("#containerVideo").collapse();
            $w("#btnNext").collapse();
            $w("#btnBack").collapse();
        }
        else if (itemCount <= 2){
            $w("#btnNext").collapse();
            $w("#btnBack").collapse();
        }

        $w("#btnNext").onClick(() => handleNext(items, '#repeaterVideoGallery', 0.31333));
        $w("#btnBack").onClick(() => handleBack(items, '#repeaterVideoGallery', 0.31333));
    });
});
