//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

//Holds Prefab data
export default class Prefab {

    #data;

    constructor(sourceData, view) {

        this.#data = {
            "name": "",
            "value": 0,
            "height": 70,
            "width": 70,
            "texture": "",
            "mass": 90,
            "restitution": 0,
            "friction": 1,
            "shape": "square",
            "hide": true
        }

        this.$view = view;

        if(sourceData != undefined) {
            this.#data = {...this.#data, ...sourceData }
            this.#data.id = this.#generateID(this.#data.name);
        }
    }

    //Generate an id from a name
    #generateID(name) {

        name = name.toLowerCase();
        name = name.replaceAll(" ", "-");
        return name;
    }

    serialize() {
        
        return this.#data
    }
    
    get name() { return this.#data.name }
    get value() { return this.#data.value }
    get id() { return this.#data.id }
    get height() { return this.#data.height }
    get width() { return this.#data.width }
    get texture() { return this.#data.texture }
    get mass() { return this.#data.mass }
    get restitution() { return this.#data.restitution }
    get friction() { return this.#data.friction }
}