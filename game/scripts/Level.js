//Copyright (C) 2022 Arseniy Skudaev, Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

import Cannon from "../../editor/scripts/Cannon.js";
import GameObject from "./GameObject.js";
import Projectile from "./Projectile.js";
  
export const PROJECTILE_LAUNCH = "#launchBall"
  
//Holds level data
export default class Level {

    #data;
    #collidableList;
    #targetCount;
    #cannon;
    #projectile;
 
    constructor(sourceData, game) { 

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

        if(game && game.musicPlayer)
            this.musicPlayer = game.musicPlayer;

        this.#collidableList = [];
        this.#cannon = null;
        this.#targetCount = 0;

        if(sourceData != undefined) 
            this.#data = {...this.#data, ...sourceData }
    }

    //Sets up a level, creating collidables, targets and placing the cannon
    setUp(app) {

        $(PROJECTILE_LAUNCH).click(()=>{  
            if (parseInt($('#projectiles').html()) >  0)
            this.#loadProjectile()  
        });  

        this.$view = app.$view;

        this.$view.empty();

        this.#data.level.entities.collidables.forEach(collidable => this.#loadCollidable(collidable));

        this.#data.level.entities.targets.forEach(target => this.#loadCollidable(target));

        this.#createCannon(this.cannon);
        this.musicPlayer.loopBackgroundMusic();
    }


    update() {
        //Simulate a period of time
        this.#destroyExpired()
        this.model.Step( 1/ 60, 10, 10); 
        this.model.ClearForces();
    }

    #destroyExpired() {

        this.#collidableList.forEach(collidable => {
            if(collidable.shouldDestroy()){ 
                this.model.DestroyBody(collidable.body); 
            }
        })
    }

    render(deltaTime) {

        this.#collidableList.forEach(collidable => {
            collidable.render(deltaTime) 
        })
        if (this.#projectile) 
        this.#projectile.render(deltaTime) 
        
    }

    #loadProjectile(){
        let projectile = this.#createProjectile();  
        this.#setStyle(projectile.$view, `--height: ${projectile.height}px;--width:${projectile.width}px;--image: url(../${projectile.texture});`)
        projectile.$view.css({top: projectile.y, left: projectile.x})
        this.#projectile = projectile
    }

    #loadCollidable(collidable) {
        
        let gameObject = this.#createGameObject(collidable);
   
        this.#setStyle(gameObject.$view, `--height: ${gameObject.height}px;--width:${gameObject.width}px;--image: url(../${gameObject.texture});`)
        gameObject.$view.css({top: gameObject.y, left: gameObject.x})
    }

    #createCannon() {
        this.#cannon = new Cannon(this.#data.level.cannon);

        this.#cannon.$view = $(`<div id="${this.#cannon.id}" class="cannon game-object placed"></div>`)

        this.$view.append(this.#cannon.$view);
                
        this.#setStyle(this.#cannon.$view, `--height: ${this.#cannon.height}px;--width:${this.#cannon.width}px;--image: url(../${this.#cannon.texture});`);

        this.#cannon.$view.css({top: this.#cannon.y, left: this.#cannon.x});
    }

    #createProjectile(){     
        if(this.musicPlayer.backgroundMusic.isPaused()) {
            this.musicPlayer.loopBackgroundMusic()
        }
        this.musicPlayer.playFireMusic()
        let projectile = new Projectile({x: this.#cannon.centerX, y: this.#cannon.centerY}, this.model); 
        this.#collidableList.push(projectile);  
        
        projectile.$view = $(`<div id="projectile" class="projectile obstacle game-object placed"></div>`)   
        projectile.$view.addClass("projectile") 
        this.$view.append(projectile.$view);  
        setTimeout(()=>{
            if (projectile.$view) { 
                projectile.$view.remove();
            }
          }, 5000) 
        return projectile; 
    }

    //Creates collidables and adds a view to the level
    #createGameObject(data) {
        

        let gameObject = new GameObject(data, this.model);
        this.#collidableList.push(gameObject);
        
        gameObject.$view = $(`<div id=${gameObject.id != undefined ? gameObject.id : "target-" + this.#targetCount++ } class="obstacle game-object placed"></div>`)

        this.$view.append(gameObject.$view);

        return gameObject;
    }
    //Sets a view to the target list of styles
    #setStyle($view, styleList) {

        //Copy class list
        $view.attr("style", styleList);
    }

    get name() { return this.#data.level.name }
    get obstacles() { return this.#data.level.entities.collidables.length +  this.#data.level.entities.targets.length }
    get targets () {return this.#data.level.entities.targets.length} 
    get cannons() { return 1; } 
    get cannon() { return this.#data.level.cannon; }
    get projectiles() { return this.#data.level.projectiles }
    get theme() { return this.#data.level.theme }
    get oneStar() { return this.#data.level.oneStar }
    get twoStar() { return this.#data.level.twoStar }
    get threeStar() { return this.#data.level.threeStar }
}