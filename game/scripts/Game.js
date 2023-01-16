//Copyright (C) 2022 Arseniy Skudaev, Shatrujit Aditya Kumar All Rights Reserved

'use strict'
import Score from "./Score.js";
import ServerHandler from "../../editor/scripts/ServerHandler.js"
import Level, { PROJECTILE_LAUNCH } from "./Level.js";
import ThemeManager from "../../editor/scripts/ThemeManager.js";
import Physics from "./Physics.js";
import Point from "./Point.js";
import { OBSTACLE_TYPE, TARGET_TYPE } from "./GameObject.js";
import { PROJECTILE_TYPE } from "./Projectile.js"; 
import MusicPlayer from "./MusicPlayer.js";

export const OBJECT_TYPE = "object",
             LEVEL_TYPE = "level",
             LEVEL_SELECT = "#level-select",
             WALL_TYPE = "wall"

const SPLASH_SCREEN = "#splashScreen"

const SCREEN_HEIGHT = 720,
      SCREEN_WIDTH = 1280

export default class Game {

    #serverHandler;
    #levelList;
    #level;
    #themeManager;
    #splashScreen;
    #score
    
    constructor() {
        //Init serverHandler and ThemeManager
        this.#serverHandler = new ServerHandler()
        this.#themeManager = new ThemeManager()
        this.musicPlayer = new MusicPlayer()
        //Hide our splash screen
        this.#splashScreen = $(SPLASH_SCREEN)
        this.#splashScreen.hide()
        this.#score = new Score(this) 
        //Store reference to game area
        this.$view = $(".app-container");

        //Init physics world with gravity and contact listener
        const GRAVITY = new Physics.Vec2(0, Physics.GRAVITY);
        this.model = new Physics.World(GRAVITY, true);

        this.#createContactListener();

        //Create walls to bind the world
        this.#createBounds()

        //Init app behind a splash screen
        this.initSplash();

        //run simulation
        this.run()
    }

    //Set up contact listener and bind begin contact to reemove target on collision with projectile
    #createContactListener() {

        this.listener = new Physics.Listener;
        this.model.SetContactListener(this.listener);
        this.listener.BeginContact = (contact) => {
            let bodyA = contact.GetFixtureA().GetBody()
            let bodyB = contact.GetFixtureB().GetBody()
            if(bodyA.GetUserData() && bodyB.GetUserData()) {
                let typeA = bodyA.GetUserData().type
                let typeB = bodyB.GetUserData().type
                if(typeA && typeB) { 
                    this.#checkTargetAndDestroy(bodyA, typeA, bodyB, typeB)
                    this.#checkCollidableAndScore(bodyA, typeA, bodyB, typeB)
                }
            }
        }
    }

    //Check if a projectile hit a target, mark the target for destruction and get it's value
    #checkTargetAndDestroy(bodyA, typeA, bodyB, typeB) {
        let validTypes = [TARGET_TYPE, PROJECTILE_TYPE]
        if(validTypes.indexOf(typeA) != -1 && validTypes.indexOf(typeB) != -1 && typeA != typeB) {
            this.musicPlayer.playHitMusic();
            let targetBody = (typeA == TARGET_TYPE) ? bodyA : bodyB;
            targetBody.SetUserData({ destroy: true })
            let value = targetBody.GetUserData().value
            if (!value) value = 10;  
               
            this.#score.scoreTargetUpdate(value)    
           // console.log("lol",targetBody.#data.value )      
        }
    }

    //Check if a projectile hit an obstacle and get it's value
    #checkCollidableAndScore(bodyA, typeA, bodyB, typeB) {
        let validTypes = [OBSTACLE_TYPE, PROJECTILE_TYPE]
        if(validTypes.indexOf(typeA) != -1 && validTypes.indexOf(typeB) != -1 && typeA != typeB) {
            this.musicPlayer.playHitMusic();

            let targetBody = (typeA == OBSTACLE_TYPE) ? bodyA : bodyB;
            let value = targetBody.GetUserData().value
            
            let score = new Score(this)    
            if (!value || value == 0) value = 5;    
            score.scoreObstacleUpdate(value)  

        }
    }

    //Display splash screen until level list and then the first level gets loaded
    initSplash() {

        this.#splashScreen.show();
        this.#loadLevels().then(result => this.#setLevelList(result)).then(result => {
            this.#splashScreen.hide();
            if(result)
                this.#setLevel(JSON.parse(result.payload))
        })

        //Also show splash screen on when loading a level
        $(LEVEL_SELECT).on('change', event => {
            this.#splashScreen.show();
            this.#serverHandler.load(event.currentTarget.value, LEVEL_TYPE)
            .then(result =>{
                this.#splashScreen.hide();
                this.#setLevel(JSON.parse(result.payload))
            })
        })
    }

    #createBounds() {

        //Floor
        let pt = new Point().fromScreen(SCREEN_WIDTH/2, SCREEN_HEIGHT + 10);
        let delta = new Point().scaleFromScreen(SCREEN_WIDTH/2, 10);
        this.createWall(pt.x, pt.y, delta.x, delta.y);

        //Left wall
        pt = new Point().fromScreen(-10, SCREEN_HEIGHT/2);
        delta = new Point().scaleFromScreen(10, SCREEN_HEIGHT/2);
        this.createWall(pt.x, pt.y, delta.x, delta.y);

        //Right wall
        pt = new Point().fromScreen(SCREEN_WIDTH + 10, SCREEN_HEIGHT/2);
        delta = new Point().scaleFromScreen(10, SCREEN_HEIGHT/2);
        this.createWall(pt.x, pt.y, delta.x, delta.y);

        //Ceiling
        pt = new Point().fromScreen(SCREEN_WIDTH/2, -10);
        delta = new Point().scaleFromScreen(SCREEN_WIDTH/2, 10);
        this.createWall(pt.x, pt.y, delta.x, delta.y);
    }

    createWall(x = 0, y = 0, dx = 10, dy = 10) {
        //Rigidbody
        const bodyDef = new Physics.BodyDef();
        bodyDef.type = Physics.Body.b2_staticBody;

        //Fixture
        const fixtureDef = new Physics.FixtureDef();
        fixtureDef.density = 10;
        fixtureDef.restitution = 0.1;
        fixtureDef.shape = new Physics.PolygonShape();

        //Shape
        bodyDef.position.Set(x, y);
        const CENTER_VECTOR = new Physics.Vec2(x, y);
        fixtureDef.shape.SetAsBox(dx, dy, CENTER_VECTOR, 0);

        //Attach body to model
        let wallBody = this.model.CreateBody(bodyDef);
        wallBody.CreateFixture(fixtureDef);
        wallBody.SetUserData({type: WALL_TYPE})
    }

    //Set level and update it's data
    #setLevel(level) {
        this.#level = new Level(level, this);
        this.#clearBodies();
        $(PROJECTILE_LAUNCH).unbind();
        this.#level.model = this.model;
        this.#themeManager.setTheme(this.#level.theme)
        this.#level.setUp(this)
        $('#projectiles').html(this.#level.projectiles)    
        $('#1star').html(this.#level.oneStar)  
        $('#2star').html(this.#level.twoStar)  
        $('#3star').html(this.#level.threeStar)  
        $('#targets').html(this.#level.targets)


  
            
    }

    //Run through the world's bodies and clear them
    #clearBodies() {
        let body = this.model.m_bodyList;

        while(body) {
            let next = body.m_next;
            let bodyData = body.GetUserData()

            if(!bodyData || bodyData.type != WALL_TYPE) {
                this.model.DestroyBody(body);
            }
            body = next
        }
    }

    //Update the level list
    #setLevelList(result) {

        this.#levelList = result.payload

        this.#populateLevelSelect()

        return this.#getLevel() //Get first level by default
    }

    //Populates the drop down for level selection
    #populateLevelSelect() {

        $(LEVEL_SELECT).empty()

        this.#levelList.forEach(level => $(LEVEL_SELECT).append(`<option value="${level.filename}"}>${level.name}</span><br>`))
    }

    //Loads level by filename, defaults to first level
    #getLevel(filename) {
        if(!filename)
            filename = this.#levelList[0].filename

        $(LEVEL_SELECT).val(filename)
        
        return this.#serverHandler.load(filename, LEVEL_TYPE)

    }

    //Loads list of all levels
    #loadLevels() {

        return this.#serverHandler.getList(LEVEL_TYPE);
    }

    //Game update loop
    update( deltaTime ) {
        if(this.#level) this.#level.update();       
    }

    //Game render loop
    render( deltaTime ) {
        if(this.#level) this.#level.render(deltaTime);  

        const score = new Score (this)  
        // no projectiles left
        if (parseInt($('#projectiles').html()) == 0 &&  $('.projectile').length == 0)        
         score.gameOverScreen( parseInt($('#current_score').html()), parseInt($('#upper_stars').width()/50))  
    }

    //Main game loop
    run( deltaTime ) {
        this.update( deltaTime ); 
        this.render( deltaTime );
        
        window.requestAnimationFrame( deltaTime => { this.run ( deltaTime )})
    }
}

