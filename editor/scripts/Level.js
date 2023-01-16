//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

export const LEVEL_EDITTABLES = ["filename", "oneStar", "twoStar", "threeStar", "projectiles", "theme"];

//Holds level data
export default class Level {

    #data;
    #filename;

    constructor(sourceData, filename) {

        this.#data = {
            "level": {
                "name": "",
                "projectiles": 10,
                "cannon":      {"x": 0,"y": 1210 },
                "hide": true,
                "theme": "Forest",
                "entities":    {
                    "collidables": [],
                    "targets": []
                }
            }
        }

        this.$view = null;

        this.#filename = filename;

        if(sourceData != undefined) 
            this.#data = {...this.#data, ...sourceData }
    }

    //Sets up a level, creating collidables, targets and placing the cannon
    setUp(app) {

        app.appContainer.empty();

        this.#data.level.entities.collidables.forEach(collidable => app.createCollidableFromLevel(collidable));

        this.#data.level.entities.targets.forEach(target => app.loadTarget(target));

        app.createCannon(this.cannon);
    }

    //Returns updated data
    serialize(app) {

        this.update(app)
        return this.#data;
    }

    //Calls seralize for all it's dependencies
    update(app) {
        
        this.#data.level.cannon = app.serializeCannon()
        this.#data.level.entities.collidables = app.serializeCollidables()
        this.#data.level.entities.targets = app.serializeTargets()
    }

    get name() { return this.#data.level.name }
    get filename() { return this.#filename }
    get obstacles() { return this.#data.level.entities.collidables.length +  this.#data.level.entities.targets.length }
    get cannons() { return 1; }
    get cannon() { return this.#data.level.cannon; }
    get projectiles() { return this.#data.level.projectiles }
    get theme() { return this.#data.level.theme }
    get oneStar() { return this.#data.level.oneStar }
    get twoStar() { return this.#data.level.twoStar }
    get threeStar() { return this.#data.level.threeStar }

    set name(val) { this.#data.level.name = val}
    set filename(val) { this.#filename = val }
    set projectiles(val) { this.#data.level.projectiles = val}
    set theme(val) { this.#data.level.theme = val}
    set oneStar(val) { this.#data.level.oneStar = val}
    set twoStar(val) { this.#data.level.twoStar = val}
    set threeStar(val) { this.#data.level.threeStar = val}
}