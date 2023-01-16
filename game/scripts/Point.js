//Copyright (C) 2022 Shatrujit Aditya Kumar, Arseniy Skudaev,  All Rights Reserved

'use strict'

import Physics from "./Physics.js";

const SCREEN = {
    HEIGHT: 720,
    WIDTH: 1280,
}

const HALF = {
    HEIGHT: SCREEN.HEIGHT/2,
    WIDTH: SCREEN.WIDTH/2
}

//Helper to store coordinates and translate from world to screen and vice-versa
export default class Point {

    #x;
    #y;

    constructor( x = 0, y = 0) {
        this.#x = x;
        this.#y = y;
    }

    get x() { return this.#x }
    get y() { return this.#y }
    get left() { return this.#x * Physics.WORLD_SCALE + HALF.WIDTH }
    get top() { return HALF.HEIGHT - this.y * Physics.WORLD_SCALE }

    //Get as screen position
    asScreen() {

        return {
            top: this.top.toFixed(2),
            left: this.left.toFixed(2)
        }
    }

    //Translate from screen to world
    fromScreen(left, top) {

        return {
            x: (left - HALF.WIDTH) / Physics.WORLD_SCALE,
            y: (HALF.HEIGHT - top) / Physics.WORLD_SCALE
        }
    }

    //Scale without translating
    scaleFromScreen(left, top) {

        return {
            x: left / Physics.WORLD_SCALE,
            y: top / Physics.WORLD_SCALE
        }
    }
}