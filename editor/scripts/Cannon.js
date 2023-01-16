//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

const CANNON_TEXTURE = "images/cannon.png",
    CANNON_ID = "cannon",
    CANNON_NAME = "Cannon"

//Holds position and size information for the Cannon
export default class Cannon {

    #data;

    constructor(sourceData) {

        this.#data = {
            "x": 0,
            "y": 0,
            "height": 70,
            "width": 70
        }

        this.$view = null;

        if(sourceData != undefined) 
            this.#data = {...this.#data, ...sourceData }
    }

    //Updates data based on view
    #update() {

        this.height = parseInt(this.$view.css('--height'));
        this.width = parseInt(this.$view.css('--width'));
        this.x = parseInt(this.$view.css('left'));
        this.y = parseInt(this.$view.css('top'));
    }

    //Returns updated data
    serialize() {

        this.#update()
        
        return this.#data
    }
    

    get centerX() { return this.x + this.width/2 }
    get centerY() { return this.y + this.height/2 }
    get id() { return CANNON_ID }
    get name() { return CANNON_NAME }
    get x() {return this.#data.x }
    get y() {return this.#data.y }
    get height() {return this.#data.height }
    get width() {return this.#data.width }
    get texture() {return CANNON_TEXTURE }

    
    set name(val) { }
    set x(val) { this.#data.x = val }
    set y(val) { this.#data.y = val }
    set height(val) { this.#data.height = val }
    set width(val) { this.#data.width = val }
    set texture(val) {}

}