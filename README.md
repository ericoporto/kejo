# kejo_js
kejo.js is keyboard and joystick unified library for games html5 games that already have touch/mouse handled.

# how to use

You have to import this module and instantiate it first.


    import KeJo from './kejo.js'

    var kejo = new KeJo

Whenever a key is pressed `kejo_KeyPressed` event is emitted, and when it's released, `kejo_KeyReleased` is emitted. You can use event listeners on the window element.

    window.addEventListener('kejo_KeyReleased',  writeKeyUp,false);
    window.addEventListener('kejo_KeyPressed', writeKeyDown,false);

The key is passed as string under `event.detail` .

Alternatively you can monitor the keys under your gameloop using the method `isPressed`.

    if( kejo.isPressed(kejo.key.UP) ) {
      ...
    }

The possible keys by default are:

    kejo.key.LEFT
    kejo.key.UP
    kejo.key.RIGHT
    kejo.key.DOWN
    kejo.key.BUTTONA
    kejo.key.BUTTONB
    kejo.key.BUTTONX
    kejo.key.BUTTONY


# Author

Made by Érico Vieira Porto.

# License

Distributed under MIT license. See [`LICENSE`](https://github.com/ericoporto/kejo_js/blob/master/LICENSE) for more information.
