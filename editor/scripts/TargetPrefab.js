//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

const TARGET_NAME = "Target";
export const TARGET_PREFAB_ID = "target-prefab",
    TARGET_TEXTURE = "images/target.png";

//Specialized prefab to generate targets
export default class TargetPrefab {

    #data;

    constructor() {

        this.#data = {
            "height": 70,
            "width": 70,
            "value": 0,
            "texture": TARGET_TEXTURE,
            "name": TARGET_NAME
        }

        this.$view = null;
    }

    get height() { return this.#data.height }
    get width() { return this.#data.width }
    get name() { return this.#data.name }
    get texture() { return this.#data.texture }
    
    serialize() {
        
        return this.#data;
    }
}