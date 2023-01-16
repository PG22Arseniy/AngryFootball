//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved

'use strict';

import { OBJECT_TYPE, LEVEL_TYPE } from "./App.js";

const CONTENT_TYPE = "application/json";

const OBJECT_LIST_EDGE = '/api/get_object_list',
      LEVEL_LIST_EDGE = '/api/get_level_list',
      LOAD_EDGE = '/api/load',
      SAVE_EDGE = '/api/save',
      USER_NAME = "#username",
      DEFAULT_USER = "pg22shatrujit";

//Handles all server requests
export default class ServerHandler {

    #username;

    //Sets expected content type and default username
    constructor() {

        $.ajaxSetup({

            contentType: CONTENT_TYPE
        });

        this.#username = DEFAULT_USER;

        this.#initUserNameListener();
    }

    //Gets a list of all items of a specific type
    getList(type) {

        let params = {

            userid: this.#username
        };

        let edge = null;

        switch(type) {
            
            case OBJECT_TYPE:
                edge = OBJECT_LIST_EDGE;
                break;
            
            case LEVEL_TYPE:
                edge = LEVEL_LIST_EDGE;
                break;
        }

        params = JSON.stringify(params);

        return $.post(edge, params).then(response => JSON.parse(response));
    }

    //Saves payload as a file with name filename on the server, if type is valid
    save(filename, type, payload) {

        if(filename.indexOf('.') != -1) 
            filename = this.#removeExtension(filename);

        if(type == LEVEL_TYPE && !payload.level.name) 
            payload.level.name = filename

        filename = this.makeFilename(filename)

        let params = {
            userid: this.#username,
            name: filename,
            type: type,
            payload: payload
        };

        params = JSON.stringify(params);

        return $.post(SAVE_EDGE, params).then(response => JSON.parse(response));
    }

    //loads a file with name filename from the server, if type is valid
    load(filename, type) {
        
        let params = {
            userid: this.#username,
            name: this.#removeExtension(filename),
            type: type,
        };

        params = JSON.stringify(params);

        return $.post(LOAD_EDGE, params).then(response => JSON.parse(response));
    }

    //Loads all items of a type, used to populate prefabs
    loadByType(type) {

        let loadPromiseList = [];
        
        return this.getList(type).then(response => {

            if(!response.error)
                response.payload.forEach(prefab => {

                    loadPromiseList.push(
                        this.load(this.#removeExtension(prefab.filename), type)
                    );
                })
        }).then(() => { return Promise.all(loadPromiseList); });
    }

    //Removes an extension from a filename if it has one
    #removeExtension(filename) {

        if(filename.indexOf('.') != -1)
            return filename.split('.')[0];

        return filename
    }

    //Listens for change on the username input and updates username varialbe
    #initUserNameListener() {

        $(USER_NAME).on('change', event => {
            
            this.#username = event.currentTarget.value;

            if(!this.#username) this.#username = DEFAULT_USER;
        })
    }

    //Turns a name into a filename, all lowercase and hyphenated
    makeFilename(name, addExtension = false)
    {
        name = name.toLowerCase()
                   .replaceAll(" ", "-")

        if(addExtension && name.indexOf('.') == -1)
            name += '.json';

        return name
    }
}