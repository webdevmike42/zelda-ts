# zelda-ts

This is my attempt on building a 2D Zelda-like adventure without any 3rd party engines or libraries - just plain typescript!

The latest version includes:
* whole overworld map from NES Zelda
* easy support of different tilesets and images
* 8 direction movement
* solid collision (rectangles only)
* cave with old man
* red oktorok
* stalfos
* red goriya
* red bat (draft)
* enemies can either be controlled by AI or by player
* static and moving hazard
* treasure chest
* floor switch
* push-/pull block
* minor and major collectable items (e.g. sword, keys, ...)
* conveyor
* teleporter
* objects can be normal (they reset when re-entering a screen), persistent or global
* overworld music and some audios

Not everything from the list is active in the demo, just remove/add things in "mockserver.ts" 

Controls:
8-direction movement: WASD
Action: K
Dash: L (not yet used in demo)

Concepts:
I am not a professional developer, but I tried to stick to the following concepts:
* finite state machine (FSM)
* functional programming
* object composition
* abstraction of input, so that a mapping of input keys can easily be implemented
* separation of gameobject states, AI and input (so the controller of an enemy can switched between player and AI on the fly)
* clean code in general

Feel free to share or build upon my code (credit is appreciated).
I appreciate feedback of any kind. If you have questions, feel free to write me a message.

CREDITS:
Mister Mike/Zephiel87: Zelda images and tileset
YT Channel "EasyGameDev": watching some episodes inspired me to do it on my own, but with cleaner concepts
Ivan Voirol on opengameart.org for the gfx-graphics (in demo only used for the treasure chest)
