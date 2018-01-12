//kejo.js

export default class kejo {
  constructor({
    autoupdategamepad, 
    map,
  }={}) {
    //a simple version string
    this._version = '0.1.0'

    //this contains keys currently pressed as enum, should only be accessed
    //through isPressed
    this._pressed = {}
    
    //this allows key enum to key name translation
    this._KeysString = ['LEFT','UP','RIGHT','DOWN', 
                       'BUTTONA','BUTTONB','BUTTONX','BUTTONY']

    //enum containing each key as number
    this._redrawkey = {
        LEFT: 0, UP: 1, RIGHT: 2, DOWN: 3,
        BUTTONA: 4, BUTTONB: 5, BUTTONX: 6, BUTTONY: 7
    },

    //
    this._keyboardMap = {}
    this._gamepadMap = {}
    this._previousGamepadKeys = {}
    this._lastInputType = ''
    this.map = {}

    //when KeJo is loaded, if no alternative map is specified, it loads the _defaultMap
    this._defaultmap = {
      k: {
        LEFT: [37, 65],           //arrow left, key a
        UP: [38, 87],             //arrow up, key w
        RIGHT: [39, 68],          //arrow right, key d
        DOWN: [40, 83],           //arrow down, key s
        BUTTONA: [73, 13, 32],    //key i, enter, space
        BUTTONB: [74,17],         //key j, ctrl
        BUTTONX: [79, 220, 191],  //key o, key \, key ;
        BUTTONY: [75, 16],        //key k, shift
      },
      g: {
        LEFT: ['axes', 0, '<'],   //left pad, to left
        UP: ['axes', 1, '<'],     //left pad, to up
        RIGHT: ['axes', 0, '>'],  //left pad, to right
        DOWN: ['axes', 1, '>'],   //left pad, to down
        BUTTONA: ['buttons', 0],  //button 'A'
        BUTTONB: ['buttons', 1],  //button 'B'
        BUTTONX: ['buttons', 2],  //button 'X'
        BUTTONY: ['buttons', 3],  //button 'Y'
      }
    }

    //this provides man readable translation for keyboard keycodes
    this._readableKeyCodeMap = {
      8: 'backspace', 9: 'tab', 13: 'enter', 16: 'shift', 17: 'ctrl', 18: 'alt',
      19: 'pause/break', 20: 'caps lock', 27: 'escape', 32: 'space',
      33: 'page up', 34: 'page down', 35: 'end', 36: 'home', 37: 'left arrow',
      38: 'up arrow', 39: 'right arrow', 40: 'down arrow', 45: 'insert',
      46: 'delete', 48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5',
      54: '6', 55: '7', 56: '8', 57: '9', 65: 'a', 66: 'b', 67: 'c', 68: 'd',
      69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l',
      77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
      85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z',
      91: 'left super key', 92: 'right super key', 93: 'select key',
      96: 'numpad 0', 97: 'numpad 1', 98: 'numpad 2', 99: 'numpad 3',
      100: 'numpad 4', 101: 'numpad 5', 102: 'numpad 6', 103: 'numpad 7',
      104: 'numpad 8', 105: 'numpad 9', 106: 'multiply', 107: 'add',
      109: 'subtract', 110: 'decimal point', 111: 'divide', 112: 'f1',
      113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7',
      119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12', 144: 'num lock',
      145: 'scroll lock', 186: 'semi-colon', 187: 'equal sign', 188: 'comma',
      189: 'dash', 190: 'period', 191: 'forward slash', 192: 'grave accent',
      219: 'open bracket', 220: 'back slash', 221: 'close braket',
      222: 'single quote'
    }

    //this is set to true by default, meaning it will auto update. You can control
    //this value during setup.
    this._loopUpdateGamepad = true

    //the analog stick will be considered activated and interpreted as binary
    //true when it's bigger than this value. (smaller if negative)
    this._gamepadDeadzone = 0.4



    //let's set the initial conditions for every parameter!
    if(typeof autoupdategamepad === 'undefined' || autoupdategamepad === null){
        this._loopUpdateGamepad = true;
    } else {
        this._loopUpdateGamepad = autoupdategamepad;
    }
    if(typeof map === 'undefined' || map === null){
        this.map = this._defaultmap;
    } else {
        this.map = map;
    }

    //configures keyboard key map to internal keys
    for(var ibutton in this.map.k){
        var keyCodes = this.map.k[ibutton];
        for(var i=0; i<keyCodes.length; i++){
        var keyCode = keyCodes[i];
        this._keyboardMap[keyCode] = this.key[ibutton];
        }
    }

    //configures gamepad buttons and axes map to internal keys
    for(var ibutton in this.map.g){
        var gamepadCodes = this.map.g[ibutton];
        this._gamepadMap[this.key[ibutton]] = this._genericGamepadCheck(gamepadCodes);
    }

    //setting inital condition for _previousGamepadKeys
    for(var k in this.key){
        var kvalue=this.key[k];
        this._previousGamepadKeys[kvalue]=false;
    }

    //setting inital condition for _previousTouchpadKeys
    for(var k in this.key){
        var kvalue=this.key[k];
        this._previousTouchpadKeys[kvalue]=false;
    }

    window.addEventListener('keyup',  this.onKeyup ,false);
    window.addEventListener('keydown', this.onKeydown,false);
    if(this._loopUpdateGamepad){
        setTimeout(this.updateGamepad,1000/60);
    }
  }


  // helper function used to translate the gamepad map.g
  _genericGamepadCheck(gamepadCodes){
    var axesbuttons = gamepadCodes[0]; //is either 'axes' or 'buttons'
    var n = gamepadCodes[1];  // the number of either the axe or the button
    var moreless = gamepadCodes[2]; // for axes, is either '>' or '<'

    if(axesbuttons=='axes'){
      if(moreless == '<'){
        return function(pad,that){
          if ((typeof pad !== 'undefined') && pad != null) {
            return pad.axes[n] < -that._gamepadDeadzone;
          }
        };
      } else {
        return function(pad){
          if ((typeof pad !== 'undefined') && pad != null) {
            return pad.axes[n] > that._gamepadDeadzone;
          }
        };
      }
    } else {
      return function(pad){
        if ((typeof pad !== 'undefined') && pad != null) {
          return !!pad.buttons[n].pressed;
        }
      };
    }
  }

  keyCodeToReadable(keyCode) {
    if(typeof keyCode === undefined){
      return;
    }
    if( keyCode in this._readableKeyCodeMap){
      return this._readableKeyCodeMap[keyCode];
    }
    return parseInt(keyCode).toString();
  }

  charToKeyCode(char) {
    return char.charCodeAt(0)
  }

  onKeydown(event) {
    var that = this
    if(event.keyCode in that._keyboardMap){
      event.preventDefault()
      if(that._pressed[that._keyboardMap[event.keyCode]] != true){
        var newEvent = new CustomEvent('ktg_KeyPressed', {
           'detail': that._KeysString[that._keyboardMap[event.keyCode]]});
        window.dispatchEvent(newEvent);
      }

      that._pressed[that._keyboardMap[event.keyCode]] = true;

      that._lastInputType = 'keyboard'
    }
  }

  onKeyup(event) {
    var that = this
    if(event.keyCode in that._keyboardMap){
      event.preventDefault()
      delete that._pressed[that._keyboardMap[event.keyCode]];
      var newEvent = new CustomEvent('ktg_KeyReleased', {
        'detail': that._KeysString[that._keyboardMap[event.keyCode]]});
      window.dispatchEvent(newEvent);
      that._lastInputType = 'keyboard'
    }
  }


  updateGamepad(){
    var that = this
    var gamepad = navigator.getGamepads()[0]
    if ((typeof gamepad !== 'undefined') && gamepad != null) {
      for(var k in that.key){
        var kvalue=that.key[k]
        var padkeypressed = that._gamepadMap[kvalue](gamepad)
        //check if key was just pressed
        if(padkeypressed == true && that._previousGamepadKeys[kvalue] == false){
          that._pressed[kvalue] = true
          that._previousGamepadKeys[kvalue] = true

          //throw a ktg event
          var newEvent = new CustomEvent('ktg_KeyPressed', {
            'detail': that._KeysString[kvalue]})
          window.dispatchEvent(newEvent)

          that._lastInputType = 'gamepad'

        //if it was not, check if it was just released
      } else if(padkeypressed == false && that._previousGamepadKeys[kvalue] == true){
          that._previousGamepadKeys[kvalue] = false;
          delete that._pressed[kvalue]

          //throw a ktg event
          var newEvent = new CustomEvent('ktg_KeyReleased', {
            'detail': that._KeysString[kvalue]})
          window.dispatchEvent(newEvent)

          that._lastInputType = 'gamepad'
        }
      }
    }

    if(that._loopUpdateGamepad){
      setTimeout(that.updateGamepad,1000/60);
    }
  }

  isPressed(key) {
    return !!this._pressed[key]
  }


  //if you need to handle game ui changes depending on last input being from
  //keyboard or gamepad (or touch), you can read information using this function
  getLastInputType(){
    return this._lastInputType;
  }

  //a printable map of the keyboard, may be ueful to present in a menu.
  getPrintableKeyboardMap(){
    var text=''
    for(var i=0; i<this._KeysString.length; i++){
      text=text+this._KeysString[i]+': '
      var keyCodes = this.map.k[this._KeysString[i]];
      for(var j=0; j<keyCodes.length; j++){
        text=text+this.keyCodeToReadable(keyCodes[j]);
        if(j<keyCodes.length-1)
          text=text+', '
      }
      if(i<this._KeysString.length-1)
        text=text+"\n"
    }
    return text
  }

  destroy() {
    //remove listeners
    window.removeEventListener('keyup',  this.onKeyup ,false)
    window.removeEventListener('keydown', this.onKeydown,false)
  }
}

// MIT License
//
// Copyright (c) 2018 Érico Vieira Porto
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
