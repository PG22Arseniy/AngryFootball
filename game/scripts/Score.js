
//Copyright (C) 2022  Arseniy Skudaev, All Rights Reserved

import Level from "./Level.js";





 export default class Score {
     #stars
     #score
     constructor (game){   
        this.#stars = 0
        this.#score = 0
        this.musicPlayer = game.musicPlayer;
     }

     // target hit
     scoreTargetUpdate(value){  
        let targets =  parseInt($('#targets').html()) 
        targets -- 
        $('#targets').html(targets)   

        this.#score =  parseInt($('#current_score').html()) 
        this.#score += value   
        $('#current_score').html(this.#score)          
        if (targets == 0) this.#stars = 3 
        else
        if (targets == 1) this.#stars = 2   
        else this.#stars = 1  
        $('#upper_stars').css("width",`${this.#stars*50}px`)    
         
           if (targets == 0) {
              this.gameOverScreen(this.#score, this.#stars)
              this.musicPlayer.stopBackgroundMusic(); 
              if(targets == 0) {
                 this.musicPlayer.playWinMusic();
              } else {
                 this.musicPlayer.playLossMusic();
              }
           } 
     } 

     // obstacle hit
     scoreObstacleUpdate(value){
      this.#score =  parseInt($('#current_score').html()) 
      this.#score += value  
      $('#current_score').html(this.#score)    
     }


      // win or loss: 
     gameOverScreen(score, stars){

        $('#final_score').html(score) 
        $('#final_stars').css("width",`${stars*50}px`) 

        $('#gameOverScreen').removeClass("hide") 
        $('#main').addClass("disabled")  
       // $("#main").prop('disabled',true);  

       $("#next_level").click (()=>{
        $('#gameOverScreen').addClass("hide")  
        $('#main').removeClass("disabled") 
        location.reload(); 
       })
     }
     
 }

   