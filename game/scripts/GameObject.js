//Copyright (C) 2022 Arseniy Skudaev, Shatrujit Aditya Kumar, All Rights Reserved

'use strict'

import Point from "./Point.js";
import Physics from "./Physics.js"
export const OBSTACLE_TYPE = "Obstacle",
             TARGET_TYPE = "Target" 
const TARGET_TEXTURE = "images/target.png"
export default class GameObject { 

    #data;
    #model;
    constructor( data, worldModel ) {
        this.#data = data;

        this.#createModel( worldModel )
    }

    //Create a dynamic body with parameters from the game object data
    #createModel(worldModel) {

        const bodyDef = new Physics.BodyDef();
        bodyDef.type = Physics.Body.b2_dynamicBody;
        
        const fixtureDef = new Physics.FixtureDef();
        fixtureDef.density = this.density;
        fixtureDef.friction = this.friction;
        fixtureDef.restitution = this.restitution;
        
        let worldPoint = new Point().fromScreen(this.centerX, this.centerY)
        bodyDef.position.Set(worldPoint.x, worldPoint.y);
        const CENTER_VECTOR = new Physics.Vec2(worldPoint.x, worldPoint.y);

        switch(this.shape) {
            
            case "square":
            case "rectangle":
                fixtureDef.shape = new Physics.PolygonShape();
                fixtureDef.shape.SetAsBox(this.#data.width/(2 * Physics.WORLD_SCALE), this.#data.height/(2 * Physics.WORLD_SCALE), CENTER_VECTOR, 0);
                break;

            //If it's a circle (or doesn't have a shape then make it a circle), ensure height and width are same (pick the lower value)
            case "circle":
            case undefined:
                fixtureDef.shape = new Physics.CircleShape();
                if(this.height > this.width) this.height = this.width;
                else this.width = this.height;
                fixtureDef.shape.m_radius = this.width / (2 * Physics.WORLD_SCALE);
                break;
        }
        
        this.#model = worldModel.CreateBody(bodyDef);
        this.#model.CreateFixture(fixtureDef);
        if(this.id != undefined) {
            this.#model.SetUserData({type: OBSTACLE_TYPE, value: this.value})
        }
        else {
            this.#model.SetUserData({type: TARGET_TYPE, value: this.value})
        }
    }

    //Render at new position
    render() { 

        let angle = this.#model.GetAngle() * Physics.RAD_2_DEG;
        let worldCenter = this.#model.GetPosition()

        let screenCenter = new Point(worldCenter.x, worldCenter.y).asScreen()
        let offset = {top: Math.round(screenCenter.top - this.height/2), left: Math.round(screenCenter.left - this.width/2)}
        
        this.$view.css({
            top:offset.top,                 
            left:offset.left,
            transform: `rotate(${angle}deg)`
        });                
    }

    //Check if we should destroy this before running a step for the model
    shouldDestroy() {

        if(this.#model && this.#model.GetUserData().destroy){
            this.$view.remove() 
            return true
        }

        return false
    }

    get body() { return this.#model }
    get height() { return this.#data.height }
    get width() { return this.#data.width }
    get value() { return this.#data.value }
    get worldHeight() { return this.#data.height / Physics.WORLD_SCALE }
    get worldWidth() { return this.#data.width / Physics.WORLD_SCALE }
    get texture() { return this.#data.texture ? this.#data.texture: TARGET_TEXTURE }
    get density() { return this.mass / (this.worldHeight * this.worldWidth)}
    get friction() { return this.#data.friction }
    get x() { return this.#data.wx?this.#data.wx:this.#data.x }
    get y() { return this.#data.wy?this.#data.wy:this.#data.y }
    get id() { return this.#data.id }
    get mass() { return this.#data.mass ? this.#data.mass : 0 }
    get restitution() { return this.#data.restitution ? this.#data.restitution : 0 }
    get centerX() { return this.x + this.#data.width/2 }
    get centerY() { return this.y + this.#data.height/2 }
    get shape() { return this.#data.shape }

    set height(val) { this.#data.height = val }
    set width(val) { this.#data.width = val } 
}

