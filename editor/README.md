# *** PG22 T2 JavaScript Web Apps  - Level Editor ***
---------------------------------------
Shatrujit Aditya Kumar
30th March, 2022

Level Editor client-server application to create levels for a physics-based catapult game

## Synopsis
---------------
Client can be used to create levels and populate them with targets, obstacles, and place a cannon.
Levels can be given themes, and point values for different star ratings.
Obstacles can be resized, have thir mass, friction, texture, and material editted.

The server can load or save level and obstacle data, and get lists of all levels/obstacles.
Server data is stored as individual JSON files for each level and obstacle.


## Motivation
---------------
The goal for the course assignemtns is to produce a physics based shooting game where the player has control of a single “catapult” that fires projectiles.
This assignment will have each student create a client server application that allows the editing of levels for the game.

One of the keys to the game is to have multiple “levels” or puzzles to solve, and the most expedient way to achieve that goal is to construct a full level editor,
the Catapults Level Editor (CLE).

## License
---------------
This Level Editor uses the MIT License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


# Download/Install
---------------------------------------

- [Download](https://github.com/pg22shatrujit/LevelEditor) or clone the _main branch_ of `https://github.com/pg22shatrujit/LevelEditor.git`
- Install [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Navigate to the repository and run `npm i` to install dependencies
- Install nodemon globally with `npm i -g nodemon`

# *** How to use ***
---------------------------------------
- Run with the command `npm run server` (or `npm run test` for debugging)
- Navigate to address `127.0.0.1:3000` in a web browser
- Enter your username in the input on the upper righthand corner of the app to begin

### Adding Levels
- Enter a level name in the input along the header
- Click the "New Level" button
- Drag and drop targets, obstacles, and cannons into the level area to create a level

### Editting and Saving Levels
- You can edit level details from the form element in the lower lefthand corner of the app.
- When you've added all your elements to your level, click the "Save Level" button in the upper lefthand corner of the app to save it

### Adding Objects
- You can add objects to a level by dragging a prefabricated object into the level area from the list of options along the bottom of the app
- To create a new object, drag an existing one into the area, edit it's values, and click the "Save Object" button along the header of the app.


## API Reference
---------------

### Get Level List
URL: `/api/get_level_list/`

Params:
```
{
    "userid": <valid vfs username>, eg pg15student
}
```

Success Response
```
{
    "payload": [
        { name: "level_name": filename: "actual_filename.json"}',
        { name: "level_name": filename: "actual_filename.json"}',
    ],
    "error": 0
}
```

Error Response
```
Condition: If 'userid' does not exist.
{
    "error": 1+ // Greater than zero on error
}
```



### Get Object List
URL: `/api/get_object_list/`

Params:
```
{
    "userid": <valid vfs username>, eg pg15student
}
```

Success Response
```
{
    "payload": [
        { name: "level_name": filename: "actual_filename.json"}',
        { name: "level_name": filename: "actual_filename.json"}',
    ],
    "error": 0
}
```

Error Response
```
Condition: If 'userid' does not exist.
{
    "error": 1+ // Greater than zero on error
}
```



### Load
URL: `/api/load/`

Params:
```
{
    "userid": "valid vfs username", // eg pg15student
    "name": "filename", // name of entity, no spaces, no extension
    "type": "object" | "level", // one of these two key strings
}
```

Success Response
```
{
    "name": "requested entity name",
    "payload": "JSONString" // actual data in JSON format 
    "bytes": "actual bytes read",
    "error": 0
}
```

Error Response
```
Condition: If 'userid' does not exist.
{
    "error": 1+ // Greater than zero on error
}
```



### Save
URL: `/api/save/`

Params:
```
{
    "userid": "valid vfs username", // eg pg15student
    "name": "filename", // name of entity, no spaces, no extension
    "type": "object" | "level", // one of these two key strings
    "payload": "JSONString" // actual data in JSON format 
}  
```

Success Response
```
{
    "name": "requested entity name",
    "bytes": "actual bytes written",
    "error": 0
}   
```

Error Response
```
Condition: If 'userid' does not exist.
{
    "error": 1+ // Greater than zero on error
}
```

