import { handleNext, handleBack } from 'public/arrows.web.js';

$w.onReady(function () {
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
