//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

import { TARGET_TEXTURE } from "./TargetPrefab.js";
const TARGET_NAME = "Target",
    TARGET_ID_PREFIX = "target-";

//Holds Target data
export default class Target {

    #data;
    #id;

    constructor(sourceData, id) {

        this.#data = {
            "wx": 0,
            "wy": 0,
            "height": 70,
            "width": 70,
            "value": 0
        }

        this.$view = null;

        if(sourceData != undefined)
            this.#data = {...this.#data, ...sourceData }

        this.#id = TARGET_ID_PREFIX + id;
    }

    //returns updated data
    serialize() {

        this.#update()
        return this.#data
    }

    //Updates position data from the view
    #update() {
        
        this.#data.wx = parseInt(this.$view.css('left'))
        this.#data.wy = parseInt(this.$view.css('top'))
        this.#data.height = parseInt(this.$view.css('--height'))
        this.#data.width = parseInt(this.$view.css('--width'))
    }

    get height() { return this.#data.height }
    get width() { return this.#data.width }
    get name() { return TARGET_NAME }
    get texture() { return TARGET_TEXTURE }
    get id() { return this.#id }
    get value() { return this.#data.value }

    set height(val) { this.#data.height = val }
    set width(val) { this.#data.width = val }
    set name(val) { }
    set texture(val) { }
    set value(val) { this.#data.value = val }

}