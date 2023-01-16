//Copyright (C) 2022 Shatrujit Aditya Kumar, Arseniy Skudaev, All Rights Reserved

'use strict'

import Point from "./Point.js";
import Physics from "./Physics.js"
import Game from "./Game.js";
export const PROJECTILE_TYPE = "Projectile"
const SIZE = {"height": 70, "width": 70}

   
const TARGET_TEXTURE = "images/ball.png"  
let cannonAngle = 0;  
let vectorAngle = {"x": 1, "y":0} 

// transform cannon:
 $('#cannonUp').click(()=>{ 
     cannonAngle -= 5; 
     if (cannonAngle < -80) cannonAngle = -80  
     vectorAngle.x = Math.cos(-cannonAngle*Math.PI/180)
     vectorAngle.y = Math.sin(-cannonAngle*Math.PI/180) 
    $("#cannon").css({  
        "-webkit-transform": `rotate(${cannonAngle}deg)`, 
        "-moz-transform": `rotate(${cannonAngle}deg)`,
        "transform": `rotate(${cannonAngle}deg)` 
    });
});
$('#cannonDown').click(()=>{  
    cannonAngle += 5;   
    if (cannonAngle > 0) cannonAngle = 0   
    vectorAngle.x = Math.cos(-cannonAngle*Math.PI/180) 
    vectorAngle.y = Math.sin(-cannonAngle*Math.PI/180) 
   $("#cannon").css({  
       "-webkit-transform": `rotate(${cannonAngle}deg)`, 
       "-moz-transform": `rotate(${cannonAngle}deg)`,
       "transform": `rotate(${cannonAngle}deg)` 
   });
});  

// launch projectile
$('#launchBall').click(()=>{ 
    let shotsLeft = parseInt($('#projectiles').html())    
    shotsLeft --;
    if (shotsLeft<0) shotsLeft = 0 
    $('#projectiles').html(shotsLeft)  
    
    if (shotsLeft == 0){

    }
});

// getting shot power
$('#shotPower').click((event)=>{
    let left = event.pageX - $('#shotPower').offset().left;      
    $('#shotPower').attr('value',left);  
    let shotPower = Math.round(left/ $('#shotPower').width() * 100)
    $('#shotPower').html( shotPower )     
      
})


export default class Projectile {
    #shotPower
    #data;
    #model;
    constructor( position, worldModel ) {
        this.#data = {
            "x": position.x,
            "y": position.y,
            "height": SIZE.height,
            "width": SIZE.width
        };
        this.#shotPower = 1000 *  parseInt($('#shotPower').html( ) );   
        this.#createModel( worldModel ) 
    }

    //Create a dynamic body and add it to the world
    #createModel(worldModel) {
        
        const bodyDef = new Physics.BodyDef();
        bodyDef.type = Physics.Body.b2_dynamicBody
        
        const fixtureDef = new Physics.FixtureDef();
        fixtureDef.density = 4;  
        fixtureDef.friction = 0.5;      
        fixtureDef.restitution = 0.4;    
        
        let worldPoint = new Point().fromScreen(this.centerX, this.centerY)
        bodyDef.position.Set(worldPoint.x, worldPoint.y);
        const CENTER_VECTOR = new Physics.Vec2(worldPoint.x, worldPoint.y);

        fixtureDef.shape = new Physics.CircleShape();
        if(this.height > this.width) this.height = this.width;
        else this.width = this.height;
        fixtureDef.shape.m_radius = this.width / (2 * Physics.WORLD_SCALE);
    
        this.#model = worldModel.CreateBody(bodyDef);
        this.#model.CreateFixture(fixtureDef);
        this.#model.SetUserData({type: PROJECTILE_TYPE})
        this.#model.ApplyForce( new Physics.Vec2(this.#shotPower  * vectorAngle.x, this.#shotPower *vectorAngle.y),CENTER_VECTOR);
        setTimeout(()=>{
            if (this.$view) {
                this.#destroyPhysicsModel()  
            }
          }, 5000) 
    }

    //Set destroy to true
   #destroyPhysicsModel() {
        this.#model.SetUserData({ destroy: true })
    }

    //Destroy 
    shouldDestroy() {
        if(this.#model && this.#model.GetUserData().destroy)
            return true

        return false
    }

    //Render at new position
    render() {
        let worldCenter = this.#model.GetPosition()
        let angle = this.#model.GetAngle() * Physics.RAD_2_DEG;
        if (this.#model.GetLinearVelocity().x == 0 && this.#model.GetLinearVelocity().y == 0)  { 
            this.$view.remove() 
            this.#destroyPhysicsModel()
        }  
        let screenCenter = new Point(worldCenter.x, worldCenter.y).asScreen()
        let offset = {top: Math.round(screenCenter.top - this.height/2), left: Math.round(screenCenter.left - this.width/2)}
        this.$view.css({
            top:offset.top,  
            left:offset.left,
            transform: `rotate(${angle}deg)`                         
        });
    }

    get body() { return this.#model }
    get height() { return this.#data.height }
    get width() { return this.#data.width }
    get texture() { return this.#data.texture ? this.#data.texture: TARGET_TEXTURE }
    get x() { return this.#data.wx?this.#data.wx:this.#data.x }
    get y() { return this.#data.wy?this.#data.wy:this.#data.y }
    get id() { return this.#data.id }
    get friction() { return this.#data.friction ? this.#data.friction : 0.5 } 
    get mass() { return this.#data.mass ? this.#data.mass : 25 } 
    get restitution() { return this.#data.restitution ? this.#data.restitution : 0.5 }
    get centerX() { return this.x + this.#data.width/2 }
    get centerY() { return this.y + this.#data.height/2 }
    get shape() { return this.#data.shape }
    
    set height(val) { this.#data.height = val }
    set width(val) { this.#data.width = val }
}

