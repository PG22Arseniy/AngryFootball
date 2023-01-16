//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

export default class Collidable {

    #data;

    constructor(prefabData, id) {

        this.#data = {
            "id": 0,
            "x": 0,
            "y": 0,
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

        this.#data = {...this.#data, ...prefabData};
        this.#data.id = id;
        this.$view = null;
    }

    get name() { return this.#data.name }
    get value() { return this.#data.value }
    get id() { return this.#data.id }
    get height() { return this.#data.height }
    get width() { return this.#data.width }
    get mass() { return this.#data.mass }
    get texture() { return this.#data.texture }
    get restitution() { return this.#data.restitution}
    get friction() { return this.#data.friction}
    
    set name(val) { this.#data.name = val }
    set value(val) { this.#data.value = val }
    set height(val) { this.#data.height = val }
    set width(val) { this.#data.width = val }
    set mass(val) { this.#data.mass = val }
    set texture(val) { this.#data.texture = val }
    set restitution(val) { this.#data.restitution = val }
    set friction(val) { this.#data.friction = val }

    get id() { return this.#data.id }

    //Updates data based on view
    #update() {
        
        this.#data.x = parseInt(this.$view.css('left'));
        this.#data.y = parseInt(this.$view.css('top'));
    }

    //Returns updated data
    serialize() {

        this.#update()
        return this.#data
    }

    //Returns serialized data without id and position, used to create a new prefab
    serializeForPrefab() {
        
        return (({ id, x, y, ...o }) => o)(this.#data)
    }
}