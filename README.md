# *** PG22 T2 JavaScript Web Apps  - Game (Angry Football) ***
---------------------------------------
Shatrujit Aditya Kumar, Arseniy Skudaev
20th April, 2022

Physics-based catapult game with a built-in client-server level editor app to read/write level data


## Synopsis
---------------
The game uses the server built for the level editor to read level list and level data, which it uses to populate the game world. For each object in the level, we create a a physics model using Box2D, as well as a view on the screen.

The player can rotate and fire form the cannon, using the three buttons on the left of the screen. The objective is to clear all the targets on the screen before running out of projectiles. They are given points for each target they clear, and a star rating if they reach a pre-determined points threshold by the end of the level. The level ends when all targets are cleared, or the player runs out of projectiles.

Different levels can be selected from the dropdown in the top right of the application.

## Motivation
---------------
The goal for this assignment is to produce a physics-based 2D web game. Create a game that makes use of levels generated and stored/retrieved from a custom game server using web technology (AJAX/REST). 

This game shall follow the theme in any way such that there are entities that are controlled by physics rigid bodies, there is at least one entity that is propelled into the other rigid bodies, and there is at least one entity that is controlled in some way by the user.   This assignment will create a client-server application that leverages levels created using the first assignment level editor.

## Contributors
---------------
pg22shatrujit@vfs.com
pg22arseniy@vfs.com

## License
---------------
This Level Editor uses the MIT License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Download/Install
---------------------------------------
- [Download](https://github.com/vfs-sct/PG22AP_AngryFootball) or clone the _main branch_ of `https://github.com/vfs-sct/PG22AP_AngryFootball.git`
- Initialize the editor submodule by double-clicking the submodule in source tree or by running from the project root:
```
git submodule init
git submodule update
```

- Install [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Navigate to the repository and run `npm i` to install dependencies
- Install nodemon globally with `npm i -g nodemon`

# *** How to use ***
---------------------------------------
- Run with the command `npm run server` (or `npm run test` for debugging)
- Navigate to address `127.0.0.1:3000` in a web browser
- Use the rotation buttons to rotate the cannon to the desired angle
- Click the shoot button to fire a projectile
- Keep track of the number of projectiles remaining and try to clear the targets before running out
- Navigate between levels using the dropdown menu on the upper-lefthand side of the screen
- Control volume with the slider above the menu dropdown


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

# *** Caveats *** (optional)
---------------------------------------

(Describe what doesn't work, what's missing and what if anything users need to
do to make it work for them. )