import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class TextFormatting {

    static width = 100;
    static height = 100;
    static staticOptions = {};
    static padding = {};

    constructor(scene, txtList, global) {
        this.scene = scene;

        let defaultOptions = {
            hAlign: 'center',
            vAlign: 'center',
            hOffset: 0,
            vOffset: 0,
            padding: { x: 10, y: 10 },
            text: 'nothing',
            padTxt: { size: 0, pad: '' },
            fontSize: 20,
            styleColor: '#000000',
            styleStroke: { color: '#ffffff', tickness: 3 }
        }

        TextFormatting.padding = TextFormatting.staticOptions.padding;
        Object.assign(defaultOptions, TextFormatting.staticOptions);

        if (Array.isArray(txtList)) {
            let ret = [];
            txtList.forEach(textOptions => {

                if (global) {
                    Object.assign(defaultOptions, global);
                    // decalage du multiligne
                    if (global.vOffset && typeof global.vOffset === 'number')
                        global.vOffset += defaultOptions.fontSize
                }

                Object.assign(defaultOptions, textOptions);

                ret.push(this.txtFormatting(defaultOptions));
            });
            return ret;
        } else {
            Object.assign(defaultOptions, txtList);
            return this.txtFormatting(defaultOptions);
        }
    }

    txtFormatting(textOptions) {

        let x, originX, y, originY = 0;
        const content = textOptions.padTxt ? String(textOptions.text).padStart(textOptions.padTxt.size, textOptions.padTxt.pad) : textOptions.text;

        // horizontal align
        switch (textOptions.hAlign) {
            case 'left':
                x = textOptions.padding.x || TextFormatting.padding.x;
                originX = 0;
                break;
            case 'right':
                x = TextFormatting.width - (textOptions.padding.x || TextFormatting.padding.x);
                originX = 1;
                break;
            default:
                x = TextFormatting.width / 2;
                originX = 0.5;
        }

        x += textOptions.hOffset;

        // vertical align
        switch (textOptions.vAlign) {
            case 'top':
                y = textOptions.padding.y || TextFormatting.padding.y;
                originY = 0;
                break;
            case 'bottom':
                y = TextFormatting.height - (textOptions.padding.y || TextFormatting.padding.y);
                originY = 1;
                break;
            default:
                y = TextFormatting.height / 2;
                originY = 0.5;
        }

        y += textOptions.vOffset;

        const txt = this.scene.add.text(
            x, y, content, {
            fontFamily: 'Barlow',
            fontSize: textOptions.fontSize,
            align: textOptions.hAlign,
            color: textOptions.styleColor
        })
            .setStroke(textOptions.styleStroke.color, textOptions.styleStroke.tickness)
            .setOrigin(originX, originY);

        // gradient ?
        if (Array.isArray(textOptions.styleColor)) {
            const gradient = txt.context.createLinearGradient(0, 0, 0, txt.height);
            textOptions.styleColor.forEach(
                (color, k) => gradient.addColorStop(k / (textOptions.styleColor.length - 1), color));
            txt.setFill(gradient);
        }

        return txt;
    }

}