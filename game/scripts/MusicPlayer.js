//Copyright (C) Shatrujit Aditya Kumar 2022, All Rights Reserved
//All sounds used are free assets from mixkit.co
//Icons from Google's Material Icon library
'use strict';

//IDs for volume control input and icon
const VOLUME_CONTROL = "#volume-control",
      VOLUME_ICON = "#volume-icon",
      //URLS to volume icons, changes displayed icon based on volume level
      VOLUME_HIGH_URL = "/game/images/volume-up.svg",
      VOLUME_LOW_URL = "/game/images/volume-down.svg",
      VOLUME_OFF_URL = "/game/images/volume-off.svg",
      SOUNDS_PATH = "/game/sounds/";

//Wrapper for buzz.js methods, used to play/loop/stop music and handle volume change
export default class MusicPlayer {

    constructor() {
        //Sets default volume to 20, and declares a previous volume
        this.volume = 20;
        this.prevVolume = this.volume;
        $(VOLUME_CONTROL).value = this.volume;

        //Sound on fire projectile
        this.fireMusic = new buzz.sound(SOUNDS_PATH + "/launch.wav", {

            volume: this.volume,
            loop: false
        });

        //Sound on target hit
        this.hitMusic = new buzz.sound(SOUNDS_PATH + "/hit.wav", {

            volume: this.volume,
            loop: false
        });


        //Sound when you win
        this.winMusic = new buzz.sound(SOUNDS_PATH + "/win.wav", {

            volume: this.volume,
            loop: false
        });


        //Sound when you lose
        this.lossMusic = new buzz.sound(SOUNDS_PATH + "/loss.wav", {

            volume: this.volume,
            loop: false
        });

        //Ambient sound
        this.backgroundMusic = new buzz.sound(SOUNDS_PATH + "/ambient.wav", {
            volume: this.volume,
            loop: true,
            preload: true
        });

        //List of sounds to easily change volume without referencing each one
        this.listOfSounds = [this.backgroundMusic, this.lossMusic, this.winMusic, this.fireMusic, this.hitMusic];

        //Set up volume control event handlers
        this.initMusicEventHandlers();
    }

    //Starts playing background music on loop
    loopBackgroundMusic() {
        this.backgroundMusic.play();
    }

    //Stops playing background music
    stopBackgroundMusic() {

        this.backgroundMusic.stop();
    }

    //The rest don't have a stop method since none loop and they're all short
    //Plays flag music
    playHitMusic() {

        this.hitMusic.play();
    }

    //Plays loss music
    playLossMusic() {

        this.lossMusic.play();
    }

    //Plays win music
    playWinMusic() {

        this.winMusic.play();
    }

    //Plays clear music
    playFireMusic() {

        this.fireMusic.play();
    }

    //Set volume for all sounds
    setAllSoundsVolume() {

        for(let i = 0; i < this.listOfSounds.length; i++) {

            if(this.listOfSounds[i])
                this.listOfSounds[i].setVolume(this.volume);
        }
    }

    //Update volume icon based on volume level
    updateVolumeIcon() {

        let volumeIcon = document.querySelector(VOLUME_ICON);

        if(this.volume > 50) {

            volumeIcon.src = VOLUME_HIGH_URL;

        } else if (this.volume == 0) {

            volumeIcon.src = VOLUME_OFF_URL;

        } else {

            volumeIcon.src = VOLUME_LOW_URL;
        }
    }

    //Set up event handlers to watch volume input and icon button
    initMusicEventHandlers() {
        
        let volumeControl = document.querySelector(VOLUME_CONTROL);
        
        //When slider value changes, update volume for all sounds and icon
        volumeControl.addEventListener("input", event => {

                this.volume = volumeControl.value;

                this.setAllSoundsVolume();
                this.updateVolumeIcon();
            });

        //When the icon gets clicked, toggle between 0 and the previous volume
        document.querySelector(VOLUME_ICON).addEventListener("click", event => {

                if(this.volume == 0) {

                    this.volume = this.prevVolume;
                    this.prevVolume = 0;

                }
                else {
                    
                    this.prevVolume = this.volume;
                    this.volume = 0;
                }

                volumeControl.value = this.volume;

                this.setAllSoundsVolume();
                this.updateVolumeIcon();
            });
    }
}