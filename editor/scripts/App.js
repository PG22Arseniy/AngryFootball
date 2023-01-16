//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

//Types to use for API calls
export const OBJECT_TYPE = "object",
      LEVEL_TYPE = "level",
      //Level editor container
      APP_CONTAINER = ".app-container";

//IDs for various containers and buttons that need to be referenced
const PREFAB_CONTAINER = "#prefabs-container",
      LEVEL_SELECT = "#level-select",
      OBJECT_DATA_CONTAINER = "#object-data-form",
      LEVEL_DATA_CONTAINER = "#level-data-form",
      NEW_LEVEL = "#new-level",
      NEW_LEVEL_NAME = "#level-name",
      SAVE_LEVEL = "#save-level",
      SAVE_OBJECT = "#save-object",
      //Editables value and classes that have access to edit
      GO_EDITTABLES = ["height", "width", "value"],
      UNEDITABLE_CLASSES = ["TargetPrefab", "Prefab"],
      PARTIALLY_EDITABLE = ["Target", "Cannon"],
      //Check if an object against this array to see if it exists (Since !val returns true for 0)
      EMPTY = [undefined, null],
      //Fall back name if no levels are found
      DEFAULT_LEVEL_NAME = "Default Level"

//Import supporting classes
import Prefab from "./Prefab.js";
import ServerHandler from "./ServerHandler.js"
import DOMManager from "./DOMManager.js";
import ThemeManager from "./ThemeManager.js";
import Collidable from "./Collidable.js";
import Level, {LEVEL_EDITTABLES} from "./Level.js";
import Target from "./Target.js";
import Cannon from "./Cannon.js";
import TargetPrefab, {TARGET_PREFAB_ID, TARGET_TEXTURE} from "./TargetPrefab.js";

export default class App {

    //Declare private variables
    #prefabDict;
    #collidableList;
    #activeObject;
    #currentLevel;
    #targetPrefab;
    #targetList;
    #cannon;
    #serverHandler;
    #domManager;
    #themeManager;
    #levelList;

    //Constructor initializes variables and sets up Event handlers
    constructor() {

        this.appContainer = $(APP_CONTAINER)

        this.#reset();

        this.#prefabDict = {};
        this.#targetPrefab = null;
        this.#cannon = null;
        this.#serverHandler = new ServerHandler();
        this.#domManager = new DOMManager();
        this.#themeManager = new ThemeManager();

        this.#initHandler();
    }

    //Reset local vars when loading a new level
    #reset() {

        this.appContainer.empty()

        this.#collidableList = [];
        this.#activeObject = null;
        this.#currentLevel = null;
        this.#targetList = [];

        this.createCannon(null)
    }
    
    //Make GO and prefabs draggable
    #makeDraggable($draggable) {

        $draggable
            .on('dragstart', event => {

                const dragData = {
                    dx: event.offsetX,
                    dy: event.offsetY,
                    id: `${event.target.id}`,
                    height: event.target.clientHeight,
                    width: event.target.clientWidth
                };
                
                //Save it's position and ID as params
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
            })

    }

    //Sets a GO or prefab as active when clicked or dragged
    #addActiveEventListeners(GO) {

        GO.$view.on('click', event => this.#setActiveObject(GO))    
            .on('dragstart', event => this.#setActiveObject(GO))

        this.#setActiveObject(GO);
    }

    //Allows draggables to be dropped into the level area
    #onDrop(event) {
        
        const dragData = this.#extractDraggableData(event);

        let $obj = $(`#${dragData.id}`);
        let styleList = $obj.attr("style");

        //Create a new 'placed' instance if it's from a prefab
        if(!$obj.hasClass("placed")) {
            if(dragData.id == TARGET_PREFAB_ID) 
                $obj = this.#createTarget(this.#targetPrefab.serialize());
            else 
                $obj = this.#createCollidable(this.#prefabDict[dragData.id].serialize(), this.#collidableList.length)

            this.#currentLevel.update(this)
            this.#loadDetails(this.#currentLevel, LEVEL_DATA_CONTAINER, LEVEL_EDITTABLES, ["Level"])
        }

        //Set it's styling to match the original
        this.#setDimensions($obj, {height: dragData.height, width: dragData.width});
            
        this.#setStyle($obj, styleList);

        this.#setOffset($obj, {x: event.pageX, y: event.pageY}, dragData, this.appContainer)

        this.#makeDraggable($obj);

    }

    //Creates targets and adds a view to the level
    #createTarget(prefab) {

        let target = new Target(prefab, this.#targetList.length);
            
        this.#targetList.push(target);
        let $obj = $(`<div id=${target.id} class="target game-object placed" draggable="true"></div>`)
        target.$view = $obj;

        this.#setStyle($obj, `--height: ${target.height}px;--width:${target.width}px;--image: url(../${target.texture});`);

        this.appContainer.append($obj);

        this.#addActiveEventListeners(target)

        return $obj;

    }

    //Creates collidables and adds a view to the level
    #createCollidable(prefabData, id) {

        let collidable = new Collidable(prefabData, id);
        this.#collidableList.push(collidable);

        let $obj = $(`<div id=${collidable.id} class="obstacle game-object placed" draggable="true"></div>`)
        collidable.$view = $obj;

        this.appContainer.append($obj);

        this.#addActiveEventListeners(collidable)

        return $obj;
    }

    //Sets a view to target dimensions
    #setDimensions($view, dimensions) {

        $view.css({
            'height': `${dimensions.height}px`,
            'width': `${dimensions.width}px`,
        });
    }

    //Sets a view to the target list of styles
    #setStyle($view, styleList) {

        //Copy class list
        $view.attr("style", styleList);
    }

    //Stops you dragging assets out of the editor area
    #setOffset($view, mousePos, bounds, $container) {
        
        let offset = this.#domManager.getOffset(mousePos, bounds, $container);

        $view.offset(offset);
    }

    //Retreives data saved on drag start
    #extractDraggableData(event) {

        const dragData = event.originalEvent.dataTransfer.getData("text/plain");

        return JSON.parse(dragData);
    }

    //Loads all prefabs from the server
    #loadPrefabs() {
        
        return this.#serverHandler.loadByType(OBJECT_TYPE);
    }

    //Loads the level list from the server
    #loadLevels() {

        return this.#serverHandler.getList(LEVEL_TYPE);
    }

    //If levels exist, sets the default one to the first available value
    #getLevel(result, filename) {

        if(result.payload.length) {

            this.#levelList = result.payload

            if(filename)
                return this.#serverHandler.load(filename, LEVEL_TYPE)

            return this.#serverHandler.load(result.payload[0].filename, LEVEL_TYPE)
        }
    }

    //Sets the current level
    #setLevel(levelObj, filename) {

        this.#reset();

        this.#currentLevel = new Level(levelObj, filename)

        this.#currentLevel.setUp(this);

        $(LEVEL_SELECT).value = this.#currentLevel

        this.#themeManager.setTheme(this.#currentLevel.theme);

        this.#loadDetails(this.#currentLevel, LEVEL_DATA_CONTAINER, LEVEL_EDITTABLES, ["Level"])
    }

    //Create a new cannon and set #cannon to it
    createCannon(cannon) {

        this.#cannon = new Cannon(cannon);
        let $obj = $(`<div id="${this.#cannon.id}" class="cannon game-object placed" draggable="true"></div>`)
        this.#cannon.$view = $obj;

        this.appContainer.append($obj);
                
        this.#setStyle($obj, `--height: ${this.#cannon.height}px;--width:${this.#cannon.width}px;--image: url(../${this.#cannon.texture});`);

        $obj.css({top: this.#cannon.y, left: this.#cannon.x});

        this.#addActiveEventListeners(this.#cannon)

        this.#makeDraggable($obj);

        return $obj;
    }

    //Create prefabs from an array of loaded prefabs
    #createPrefabsFromArray(prefabArray) {

        let $prefabContainer = $(PREFAB_CONTAINER);

        $prefabContainer.empty();

        this.#loadTargetPrefab();

        prefabArray.forEach(prefabString => this.#createPrefab($prefabContainer, prefabString))

        this.#makeDraggable($(`.prefab`));
    }

    //Loads targets from a saved level
    loadTarget(target) {

        let $obj = this.#createTarget(target);
                
        this.#setStyle($obj, `--height: ${target.height}px;--width:${target.width}px;--image: url(../${TARGET_TEXTURE});`);

        $obj.css({top: target.wy, left: target.wx})

        this.#makeDraggable($obj);
    }

    //Loads the target prefab
    #loadTargetPrefab() {

        this.#targetPrefab = new TargetPrefab()
        this.#targetPrefab.$view = this.#generatePrefabElement(TARGET_PREFAB_ID, this.#targetPrefab.height, this.#targetPrefab.width, this.#targetPrefab.texture);
        
        $(PREFAB_CONTAINER).append(this.#targetPrefab.$view);

        this.#addActiveEventListeners(this.#targetPrefab)   
    }

    //Creates Prefab and add view to the predab container
    #createPrefab(container, prefabString) {

        let prefab = new Prefab(JSON.parse(prefabString.payload))

        this.#prefabDict[prefab.id] = prefab;

        prefab.$view = this.#generatePrefabElement(prefab.id, prefab.height, prefab.width, prefab.texture);
        
        container.append(prefab.$view);

        this.#addActiveEventListeners(prefab);
    }

    //Generates HTML for a prefab
    #generatePrefabElement(id, height, width, texture) {

        return $(`<div id="${id}" class="obstacle prefab" style="--height:${height}px;--width:${width}px;--image: url(../${texture});" draggable="true"></div>`)
    }

    //Creates collidables from a saved level
    createCollidableFromLevel(collidable) {
        
        let $obj = this.#createCollidable(collidable, collidable.id);
                
        this.#setStyle($obj, `--height: ${collidable.height}px;--width:${collidable.width}px;--image: url(../${collidable.texture});`);

        $obj.css({top: collidable.y, left: collidable.x})

        this.#makeDraggable($obj);
    }

    //Sets a GO as active
    #setActiveObject(activeObject) {

        if(this.#activeObject)
            this.#activeObject.$view.removeClass("highlighted")

        this.#activeObject = activeObject;
        
        //Make sure it's not a prefab to highlight it
        if(!this.#activeObject.$view.hasClass("prefab"))
            this.#activeObject.$view.addClass("highlighted")

        this.#loadDetails(this.#activeObject, OBJECT_DATA_CONTAINER, GO_EDITTABLES, PARTIALLY_EDITABLE, UNEDITABLE_CLASSES);
    }

    //Load details into the level or object panel and marks fields as disabled or not
    #loadDetails(object, formID, edittables, partialEditting, disabledEditting) {

        let dataContainer = $(formID)
        let objectType = object.constructor.name

        for(let i = 0; i < dataContainer[0].length; i++) {

            let $field = $(dataContainer[0][i])[0];
            $field.disabled = true;

            if((!disabledEditting || disabledEditting.indexOf(objectType) == -1) && (edittables.indexOf($field.name) != -1 || partialEditting.indexOf(objectType) == -1))
                $field.disabled = false;
                
            $field.value = null;

            if(EMPTY.indexOf(object[$field.name]) == -1)
                $field.value = object[$field.name];
        }
    }

    //Wrapper for cannon.serialize()
    serializeCannon() {

        return this.#cannon.serialize()
    }

    //Wrapper that calls every collidables' serialize()
    serializeCollidables() {

        let collidables = []

        this.#collidableList.forEach(collidable => {
            collidables.push(collidable.serialize())
        })

        return collidables;
    }

    //Wrapper that calls every targets' serialize()
    serializeTargets() {

        let targets = []

        this.#targetList.forEach(target => {
            targets.push(target.serialize())
        })

        return targets;
    }

    //Wrapper for serverHandler's save()
    #saveLevel() {

        this.#serverHandler.save(this.#currentLevel.name, LEVEL_TYPE, this.#currentLevel.serialize(this));
    }

    //Sets the levelList array and calls populateLevelSelect()
    #setLevelList(result, filename) {

        this.#levelList = result.payload

        this.#populateLevelSelect()

        return this.#getLevel(result, filename) //Always gets first level TODO
    }

    //Populates the drop down for level selection
    #populateLevelSelect() {

        $(LEVEL_SELECT).empty()

        this.#levelList.forEach(level => $(LEVEL_SELECT).append(`<option value="${level.filename}"}>${level.name}</span><br>`))
    }

    //Creates a new level object
    #createNewLevel(name) {

        this.#reset();

        let newLevelName = name + '.json'

        this.#serverHandler.save(newLevelName, LEVEL_TYPE, new Level(null, newLevelName).serialize(this))
        .then(result => this.#loadLevels())
        .then(result => this.#setLevelList(result, this.#serverHandler.makeFilename(newLevelName, true)))
        .then(result => this.#setLevel(JSON.parse(result.payload), this.#serverHandler.makeFilename(newLevelName, true)))
    }

    //Saves an object as prefab on button click
    #saveObject() {

        if(this.#activeObject.constructor.name == "Collidable") {

            let newCollidable = this.#activeObject.serializeForPrefab()

            this.#serverHandler.save(newCollidable.name, OBJECT_TYPE, newCollidable)
            .then(result => this.#loadPrefabs())
            .then(result => this.#createPrefabsFromArray(result))
        }
    }

    //Update active object and it's view
    #updateActiveObject(eventTarget) {

        for(let i = 0; i < eventTarget.length; i++) {

            this.#activeObject[eventTarget[i].name] = eventTarget[i].value
        }

        this.#activeObject.$view.css('--height', this.#activeObject.height + "px")
        this.#activeObject.$view.css('--width', this.#activeObject.width + "px")
        this.#activeObject.$view.css('--image', `url(../${this.#activeObject.texture})`)
    }

    //Update current level and it's view
    #updateCurrentLevel(event) {

        LEVEL_EDITTABLES.forEach(edittable => {

            if(edittable == "theme") {

                this.#themeManager.setTheme(event.currentTarget[edittable].value)
            }

            this.#currentLevel[edittable] = event.currentTarget[edittable].value
        })
    }

    //Sets up event listeners for the app
    #initHandler() {

        //Load theme list
        this.#themeManager.loadThemes();
        
        //Load prefabs and levels
        this.#loadPrefabs().then(result => this.#createPrefabsFromArray(result));

        this.#loadLevels().then(result => this.#setLevelList(result)).then(result => {

            if(result)
                this.#setLevel(JSON.parse(result.payload), this.#levelList[0].filename)
            //Create a default level if one doesn't exist
            else
                this.#createNewLevel(DEFAULT_LEVEL_NAME);   
        })

        //Listen for drop on level container
        this.appContainer
            .on('drop', event => this.#onDrop(event))
            .on('dragover', event => event.preventDefault())

        //Handler for button click events
        $(NEW_LEVEL).on('click', event => this.#createNewLevel($(NEW_LEVEL_NAME).val()))
        
        $(SAVE_LEVEL).on('click', event => this.#saveLevel())

        $(SAVE_OBJECT).on('click', event => this.#saveObject())

        //Handler for form and drop down changes
        $(OBJECT_DATA_CONTAINER).on('change', event => this.#updateActiveObject(event.currentTarget))

        $(LEVEL_DATA_CONTAINER).on('change', event => this.#updateCurrentLevel(event))

        $(LEVEL_SELECT).on('change', event => {
            
            this.#serverHandler.load(event.currentTarget.value, LEVEL_TYPE)
            .then(result =>this.#setLevel(JSON.parse(result.payload), event.currentTarget.value))
        })
    }
}