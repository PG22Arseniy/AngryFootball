//Copyright (C) 2022 Shatrujit Aditya Kumar, All Rights Reserved
'use strict';

import { APP_CONTAINER } from "./App.js";

const IMAGE_DIR = "./images/",
      THEME_KEYWORD = "theme",
      THEME_FILES = [
          "forest-theme.jpg",
          "desert-theme.jpg",
          "cave-theme.jpg"
      ],
      EXTENSION_REGEX = /\.[^/.]+$/;

//Manages theme switching
export default class ThemeManager {

    #container;
    #themes;

    constructor() {

        this.#container = $(APP_CONTAINER);
        this.#themes = {};

        THEME_FILES.forEach(file => {

            if(file.toLowerCase().indexOf(THEME_KEYWORD) != -1) 
                this.#themes[this.#getThemeName(file)] = IMAGE_DIR + file;
        })
    }

    //Gets theme names from the filename
    #getThemeName(filename) {

        filename = filename.replace(EXTENSION_REGEX, "")
                .replace(THEME_KEYWORD, "")
                .replaceAll("-", " ")
                .trim()
                .toLowerCase();
                        
        return filename[0].toUpperCase() + filename.slice(1);
        
    }

    //Lists all themes
    #getThemeList() { return Object.keys(this.#themes); }

    //Sets the level's theme
    setTheme(theme) {

        this.#container.css("background-image", `url(/editor/${this.#themes[theme]})`)
    }

    //Loads themes and adds them to the dropdown
    loadThemes() {

        let $themeDropdown = $("#theme-select")
        let themeList = this.#getThemeList()

        themeList.forEach(theme => {
            
            $themeDropdown.append(`<option value="${theme}"}>${theme}</span><br>`);
        })

        this.setTheme(themeList[0]);
    }
}