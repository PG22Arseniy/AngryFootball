// Copyright (C) 2020 Scott Henshaw, All Rights Reserved
'use strict';

import Express from 'express';
import Path, { dirname } from 'path';
import HTTP from 'http';
import { fileURLToPath } from 'url';
import FileSystem from 'fs-extra';

const PORT = 3000;
const __dirname = dirname( fileURLToPath( import.meta.url ));

const LEVEL_DIR = "./editor/data/level/",
      OBJECT_DIR = "./editor/data/object/",
      TYPE_LIST = ["level", "object"];

class Server {

    constructor() {

        this.api = Express();
        this.api.use( Express.json() )
                .use( Express.urlencoded({ extended: false }))
                .use( Express.static( Path.join( __dirname, '.')));

        this.api.get('/', ( request, response ) => {
            const indexFile = Path.join( __dirname, './game/index.html');
            response.sendFile(indexFile, { title:'Level Editor'})
        });

        //Gets list of levels
        this.api.post('/api/get_level_list', ( request, response ) => {
            
            let result = { error: 1 };
            
            let id = request.body.userid;

            if(!this.isValidID(id)) {
                result = {error: 401}; //Unauthorized
            }

            if(!FileSystem.pathExistsSync(Path.join( __dirname, LEVEL_DIR))) {
                result = {error: 404}; //Path doesn't exist
            }

            //Creates an array of {name, filename} objects and returns it
            if(this.isValidID(id) && FileSystem.pathExistsSync(Path.join( __dirname, LEVEL_DIR))) {
                let payload = [];
                let contents = FileSystem.readdirSync(Path.join( __dirname, LEVEL_DIR))
                contents.forEach(file => {
                    payload.push({name: FileSystem.readJSONSync(Path.join( __dirname, LEVEL_DIR + file)).level.name, filename: file});
                })
                result = {error: 0, payload: payload};
            }

            response.send(JSON.stringify(result));
        });

        //Gets list of prefabs
        this.api.post('/api/get_object_list', ( request, response ) => {

            let result = { error: 1 };
            
            let id = request.body.userid;

            if(!this.isValidID(id)) {
                result = {error: 401}; //Unauthorized
            }

            if(!FileSystem.pathExistsSync(Path.join( __dirname, OBJECT_DIR))) {
                result = {error: 404}; //Path doesn't exist
            }

            //Creates an array of {name, filename} objects and returns it
            if(this.isValidID(id) && FileSystem.pathExistsSync(Path.join( __dirname, OBJECT_DIR))) {
                let payload = [];
                let contents = FileSystem.readdirSync(Path.join( __dirname, OBJECT_DIR))
                contents.forEach(file => {
                    payload.push({name: FileSystem.readJSONSync(Path.join( __dirname, OBJECT_DIR + file)).name, filename: file});
                })
                result = {error: 0, payload: payload};
            }

            response.send(JSON.stringify(result));
        });

        //Saves a level or object
        this.api.post('/api/save', ( request, response ) => {

            let result = { error: 1 };

            let data = request.body;

            if(!this.isValidID(data.userid)) {
                result = {error: 401}; //Unauthoried
            }

            if(!this.isValidType(data.type)) {
                result = {error: 400}; //Invalid Param
            }

            //Writes payload into a .json file and returns number of bytes
            if(this.isValidID(data.userid) && this.isValidType(data.type)) {

                let filename = data.name + '.json';
                let dir = this.getDirectory(data.type);
                let pathToFile = Path.join( __dirname, dir + filename);

                FileSystem.writeJSONSync(pathToFile, data.payload);
                let size = FileSystem.statSync(pathToFile).size;

                result = {error: 0, name: filename, bytes: size};
            }
            response.send(JSON.stringify(result));
        });

        //Loads a level or object
        this.api.post('/api/load', ( request, response ) => {

            let result = { error: -1 };
            let data = request.body;

            if(!this.isValidID(data.userid)) {
                result = {error: 401}; //Unauthoried
            }

            if(!this.isValidType(data.type)) {
                result = {error: 400}; //Invalid Param
            }

            //Reads payload from a .json file and returns it and number of bytes
            if(this.isValidID(data.userid) && this.isValidType(data.type)) {

                let filename = data.name + '.json';
                let dir = this.getDirectory(data.type);
                let pathToFile = Path.join( __dirname, dir + filename);

                const payload = JSON.stringify(FileSystem.readJSONSync(pathToFile));
                let size = FileSystem.statSync(pathToFile).size;

                result = {error: 0, name: filename, bytes: size, payload: payload};
            }
            response.send(JSON.stringify(result));
        });

        this.api.post('/api', ( request, response ) => {

            let result = { error: 0 };

            let JSONString = JSON.stringify( result );
            response.send( JSONString )
        });

        this.run();
    }

    run() {

        this.api.set('port', PORT );
        this.listener = HTTP.createServer( this.api );
        this.listener.listen( PORT );
        this.listener.on('listening', event => {

            let addr = this.listener.address();
            let bind = typeof addr == `string` ? `pipe ${addr}`: `port ${addr.port}`;

            console.log(`Listening on ${bind}`)
        });
    }

    //Checks if ID is valid
    isValidID(id) {
        return true;
    }

    //Checks if type is valid
    isValidType(type) {
        return TYPE_LIST.indexOf(type) != -1
    }

    //Get directory based on type
    getDirectory(type) {
        
        switch(type) {
            case TYPE_LIST[0]:
                return LEVEL_DIR;
            case TYPE_LIST[1]:
                return OBJECT_DIR;
        }

        return null;
    }
}

const server = new Server();