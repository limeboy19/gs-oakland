//import { handleNext, handleBack } from 'public/arrows.js';

import wixWindow from 'wix-window';
import wixAnimationsFrontend from 'wix-animations-frontend';

export const handleNext = async (data, elementId, moveDistanceRatio) => {
    const windowSizeInfo = await wixWindow.getBoundingRect();
    let documentWidth = windowSizeInfo.document.width;
    const shifted = data.shift();
    data.push(shifted);
    console.log("DATA: ", data);
    animate(elementId, -(documentWidth * moveDistanceRatio), data);
};

export const handleBack = async (data, elementId, moveDistanceRatio) => {
    const windowSizeInfo = await wixWindow.getBoundingRect();
    let documentWidth = windowSizeInfo.document.width;
    const popped = data.pop();
    data.unshift(popped);
    console.log('DATA: ', data);
    animate(elementId, documentWidth * moveDistanceRatio, data);
};

function animate(elementId, moveDistance, data) {
    wixAnimationsFrontend.timeline().add($w(elementId), { x: moveDistance, duration: 400, easing: 'easeOutSine' }).play()
        .onComplete(() => {
            wixAnimationsFrontend.timeline().add($w(elementId), { x: 0, duration: 0, easing: 'easeOutSine', opacity: 1 }).play();
            $w(elementId).data = data;
        });
}