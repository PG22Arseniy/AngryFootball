//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

//Used to keep objects within the game area
export default class DOMManager {

    constructor() {}

    //Gets the bounds of an elements
    #getBounds($elem) {

        let offset = $elem.offset();

        return {
            top: offset.top,
            right: $elem.width() + offset.left,
            bottom: $elem.height() + offset.top,
            left: offset.left
        }
    }

    //Generates the offset for a position, given its bounds and it's parent, tries to make sure it can't leave the area
    getOffset(mousePos, bounds, $parent) {

        let top = mousePos.y;
        if(bounds.dy) top -= bounds.dy
        let left = mousePos.x;
        if(bounds.dx) left -= bounds.dx;
        
        let parentBounds = this.#getBounds($parent);

        if(top < parentBounds.top) {
            top = parentBounds.top;
        } else if(top + bounds.height > parentBounds.bottom) {
            top = parentBounds.bottom - bounds.height;
        }

        if(left < parentBounds.left) {
            left = parentBounds.left;
        } else if(left + bounds.width > parentBounds.right) {
            left = parentBounds.right - bounds.width;
        }

        return { top: top, left : left };
    }
}