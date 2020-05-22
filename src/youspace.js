/* eslint no-undef: */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.YOUSPACE = {})));
}(this, (function (exports) { 'use strict';

    const VERSION = '2.4.0';
    const LABEL = { LEFT: 0, RIGHT: 1 };
    const STATE = { NONE: -1, START: 0, MOVE: 1, END: 2 };
    const PURPOSE = { YSCONFIG: 0, YSPERSON: 1 };
    const WEBSOCKET_HOST = 'ws://localhost:32343';
    const WEBSOCKET_PROTOCOL = 'youspace-websocket-protocol';
    const LOCAL_SERVER_HOST = 'http://localhost:9988';
    const TIME = ( typeof window !== 'undefined' && typeof window.performance !== 'undefined' ? window.performance : Date );

    function Gesture() {

        this.state = STATE.NONE;
        this.timestamp = TIME.now();

    }

    Object.assign( Gesture.prototype, {

        update: function () {}

    } );

    function SwipeGesture ( config ) {

        config = config || {};

        Gesture.call( this );

        // Minimum trigger distance in Z between hand and torso in ms
        this.minTriggerDistance = config.minTriggerDistance || 200;

        // Minimum persistent trigger time before identified as a valid detection in ms
        this.minPersistentTriggerDuration = config.minPersistentTriggerDuration || 100;

        // Minimum frame count before detecting identified as MOVE state
        this.minFrameCount = config.minFrameCount || 5;

        // Maximum frame count before cancelling to avoid swipe and point scenario
        this.maxFrameCount = config.maxFrameCount || 40;

        // Minimum trigger velocity per frame in screen pixel
        this.minTriggerVelocity = config.minTriggerVelocity || 20;

        // Post trigger delay between swipe
        this.postTriggerDelay = config.postTriggerDelay || 220;

        this.framecount = 0;
        this.lastScreenPosition = { x: 0, y: 0 };
        this.velocityHistory = { x: 0, y: 0 };
        this.startTimeStamp = 0;
        this.duration = 0; //ms

    }

    SwipeGesture.prototype = Object.create( Gesture.prototype );
    SwipeGesture.prototype.constructor = SwipeGesture;

    /**
     * Cancel swipe gesture according to current state
     */
    SwipeGesture.prototype.cancel = function () {

        this.framecount = 0;
        this.velocityHistory.x = 0;
        this.velocityHistory.y = 0;
        this.duration = 0;
        this.startTimeStamp = 0;

        switch ( this.state ) {

        case STATE.START:
        case STATE.MOVE:

            this.state = STATE.END;

            this.timestamp = TIME.now() + this.postTriggerDelay;

            break;

        case STATE.END:

            this.state = STATE.NONE;

            this.timestamp = TIME.now() + this.postTriggerDelay;
            
            break;

        default:

            return;

        }

    };

    /**
     * @param  {number} triggerDistance - distance to trigger a swipe
     * @param  {object} vector - screen coordinate top-left (0, 0) to bottom-rght (width, height) 
     * @param  {boolean} enabled - Whether to enable gesture update or not
     */
    SwipeGesture.prototype.update = function ( triggerDistance, vector, enabled ) {

        if ( triggerDistance > this.minTriggerDistance && enabled && this.state !== STATE.END ) {

            if ( TIME.now() > this.timestamp + this.minPersistentTriggerDuration ) {

                if ( this.state === STATE.NONE || this.state === STATE.END ) {

                    this.state = STATE.START;
                    this.framecount = 0;
                    this.lastScreenPosition.x = vector.x;
                    this.lastScreenPosition.y = vector.y;
                    this.velocityHistory.x = 0;
                    this.velocityHistory.y = 0;
                    this.startTimeStamp = TIME.now();
                    this.duration = 0;

                } else {

                    const deltaX = vector.x - this.lastScreenPosition.x;
                    const deltaY = vector.y - this.lastScreenPosition.y;

                    this.framecount++;

                    this.velocityHistory.x = this.velocityHistory.x * this.framecount + deltaX;
                    this.velocityHistory.y = this.velocityHistory.y * this.framecount + deltaY;

                    this.velocityHistory.x /= this.framecount;
                    this.velocityHistory.y /= this.framecount;

                    this.lastScreenPosition.x = vector.x;
                    this.lastScreenPosition.y = vector.y;

                    if ( this.framecount >= this.minFrameCount && 
                        ( Math.abs( this.velocityHistory.x ) >= this.minTriggerVelocity || Math.abs( this.velocityHistory.y ) >= this.minTriggerVelocity ) ) {

                        this.state = STATE.MOVE;
                        this.duration = TIME.now() - this.startTimeStamp;


                    }

                    if ( this.framecount > this.maxFrameCount ) this.cancel();

                }

            }

        } else {

            this.cancel();

        }

        return { status: this.state, data: vector };

    };

    function EventDispatcher() {}

    Object.assign( EventDispatcher.prototype, {

        addEventListener: function ( type, listener ) {

            if ( this._listeners === undefined ) this._listeners = {};

            const listeners = this._listeners;

            if ( listeners[ type ] === undefined ) {

                listeners[ type ] = [];

            }

            if ( listeners[ type ].indexOf( listener ) === - 1 ) {

                listeners[ type ].push( listener );

            }

        },

        hasEventListener: function ( type, listener ) {

            if ( this._listeners === undefined ) return false;

            const listeners = this._listeners;

            return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

        },

        removeEventListener: function ( type, listener ) {

            if ( this._listeners === undefined ) return;

            const listeners = this._listeners;
            const listenerArray = listeners[ type ];

            if ( listenerArray !== undefined ) {

                const index = listenerArray.indexOf( listener );

                if ( index !== - 1 ) {

                    listenerArray.splice( index, 1 );

                }

            }

        },

        dispatchEvent: function ( event ) {

            if ( this._listeners === undefined ) return;

            const listeners = this._listeners;
            const listenerArray = listeners[ event.type ];

            if ( listenerArray !== undefined ) {

                event.target = this;

                const array = listenerArray.slice( 0 );

                for ( let i = 0, l = array.length; i < l; i ++ ) {

                    array[ i ].call( this, event );

                }

            }

        }

    } );

    function DataHandler ( config, controller ) {

        config = config || {};

        this.ScreenResolution =  config.resolution || { width: 1920, height: 1080 };
        this.ScreenConfig = { width: 3660, height: 3660.0 * 9 / 16, center: { x: 0, y: 80, z: 0 } };

        this.Controller = controller;
        this.Persons = {};

        this.GoneCountdown = config.GoneCountdown || 3000;
        
    }

    Object.assign( DataHandler.prototype, {

        handleSocketDataTypeArray: function ( purpose, array, dataview ) {

            switch ( purpose )
            {
            case PURPOSE.YSCONFIG:
                this.updateScreenConfigTypeArray( array.subarray( 1 ) );
                break;

            case PURPOSE.YSPERSON:
                const personCount = dataview.getInt32( 4, true );
                this.decodeYSPersonMessageTypeArray( personCount, array.subarray( 2 ) );
                break;

            default:
                break;
            }

        },

        updateScreenConfigTypeArray: function ( array ) {

            this.ScreenConfig.width =    array[ 0 ];
            this.ScreenConfig.height =   array[ 1 ];
            this.ScreenConfig.center.x = array[ 2 ];
            this.ScreenConfig.center.y = array[ 3 ];
            this.ScreenConfig.center.z = array[ 4 ];

        },

        decodeYSPersonMessageTypeArray: function ( personCount, personsArray ) {

            let offset = 0, personLength, startIndex = 0, endIndex = 0;

            personLength = personsArray.length / personCount;

            for ( let i = 0; i < personCount; i++ ) {

                startIndex = offset + i * personLength;
                endIndex = startIndex + personLength;

                this.updatePersonDataTypeArray( personsArray.subarray( startIndex, endIndex ) );

            }

        },

        onPersonDetected: function ( person ) {

            this.Controller.dispatchEvent( { type: 'PersonDetected', message: person } );

        },

        onPersonGone: function ( person ) {

            this.Controller.dispatchEvent( { type: 'PersonGone', message: person } );

        },

        updatePersonDataTypeArray: function ( array ) {

            const person = {};

            person.personId =                   array[ 0 ];
            person.personIterator =             array[ 1 ];

            person.head =                       { x: array[ 2 ],  y: array[ 3 ], z: array[ 4 ] };
            person.torso =                      { x: array[ 5 ],  y: array[ 6 ], z: array[ 7 ] };
            person.leftArm =                    { x: array[ 8 ],  y: array[ 9 ], z: array[ 10 ] };
            person.rightArm =                   { x: array[ 11 ],  y: array[ 12 ], z: array[ 13 ] };
            person.leftLeg =                    { x: array[ 14 ],  y: array[ 15 ], z: array[ 16 ] };
            person.rightLeg =                   { x: array[ 17 ],  y: array[ 18 ], z: array[ 19 ] };
            person.hasLeftHand =                Math.floor( array[ 20 ] ) === 1 ? true : false;
            person.hasRightHand =               Math.floor( array[ 21 ] ) === 1 ? true : false;
            person.leftHand =                   { x: array[ 22 ],  y: array[ 23 ], z: array[ 24 ] };
            person.rightHand =                  { x: array[ 25 ],  y: array[ 26 ], z: array[ 27 ] };
            person.leftHandPointing =           { x: array[ 28 ],  y: array[ 29 ], z: array[ 30 ] };
            person.rightHandPointing =          { x: array[ 31 ],  y: array[ 32 ], z: array[ 33 ] };
            person.processingTime =             Math.floor( array[ 34 ] );
            person.pointsMean =                 { x: array[ 35 ],  y: array[ 36 ], z: array[ 37 ] };
            person.bodyHeight =                 array[ 38 ];
            person.hipGirth =                   array[ 39 ];
            person.waistGirth =                 array[ 40 ];
            person.bustChestGirth =             array[ 41 ];
            person.waistHeight =                array[ 42 ];
            person.leftHandDirection =          { x: array[ 43 ],  y: array[ 44 ], z: array[ 45 ] };
            person.rightHandDirection =         { x: array[ 46 ],  y: array[ 47 ], z: array[ 48 ] };
            person.torsoHeading =               array[ 49 ];
            person.leftHandDirectionPointing =  { x: array[ 50 ],  y: array[ 51 ], z: array[ 52 ] };
            person.rightHandDirectionPointing = { x: array[ 53 ],  y: array[ 54 ], z: array[ 55 ] };
            person.timestamp =                  Math.round( array[ 56 ] );
            person.leftHandGesture =            {   
                hasGesture: Math.round( array[ 57 ] ) === 1 ? true : false,
                type: Math.round( array[ 58 ] ),
                direction: Math.round( array[ 59 ] ),
                position: { x: array[ 60 ], y: array[ 61 ], z: array[ 62 ] }
            };
            person.rightHandGesture =           {   
                hasGesture: Math.round( array[ 63 ] ) === 1 ? true : false,
                type: Math.round( array[ 64 ] ),
                direction: Math.round( array[ 65 ] ),
                position: { x: array[ 66 ], y: array[ 67 ], z: array[ 68 ] }
            };

            this.updatePersonList( person );
            this.detectPrimaryHand( person );
            this.detectGesture( person );

            if ( this.Controller ) {

                this.Controller.dispatchEvent( { type: 'PersonUpdate', message: person } );

            }

        },

        updatePersonList: function ( person ) {

            const personHistory = this.Persons[ person.personId ];

            if ( person.personId >= 0 ) {

                if ( personHistory ) {

                    person.primaryHand = personHistory.primaryHand;
                    person.primaryHandLabel = personHistory.primaryHandLabel;
                    person.hasPrimaryHand = personHistory.hasPrimaryHand;
                    person.primaryHandPointing = null;
                    person.primaryHandDirection = null;
                    person.gesture = personHistory.gesture;
                    person.leaveTimerId = personHistory.leaveTimerId;

                    clearTimeout( person.leaveTimerId );

                } else {

                    person.gesture = { 

                        swipe: { 

                            detector: { 

                                leftHand: new SwipeGesture( this.SwipeDetectionConfig ), 
                                rightHand: new SwipeGesture( this.SwipeDetectionConfig ) 

                            }

                        } 
                    };

                    this.onPersonDetected( person );

                }
                
                person.leaveTimerId = setTimeout( this.onPersonGone.bind( this, person ), this.GoneCountdown );
                this.Persons[ person.personId ] = person;

            }

        },

        detectPrimaryHand: function ( person ) {

            const personHistory = this.Persons[ person.personId ];

            // Determine primary hand label

            if ( !personHistory ) return;

            if ( !personHistory.primaryHandLabel ) {

                if ( person.hasLeftHand ) {

                    personHistory.primaryHandLabel = LABEL.LEFT;

                } else if ( person.hasRightHand ) {

                    personHistory.primaryHandLabel = LABEL.RIGHT;

                }

            }

            if ( person.hasLeftHand && personHistory.primaryHandLabel === LABEL.LEFT ) {

                person.primaryHandLabel = LABEL.LEFT;
                person.hasPrimaryHand = true;

            } else if ( person.hasRightHand && personHistory.primaryHandLabel === LABEL.RIGHT ) {

                person.primaryHandLabel = LABEL.RIGHT;
                person.hasPrimaryHand = true;

            } else {

                person.primaryHandLabel = null;
                person.hasPrimaryHand = false;

            }

            // Assign primary hand pointing

            switch ( person.primaryHandLabel ) {

            case LABEL.LEFT:

                person.primaryHand = person.leftHand;
                person.primaryHandPointing = person.leftHandPointing;
                person.primaryHandDirection = person.leftHandDirection;

                break;

            case LABEL.RIGHT:

                person.primaryHand = person.rightHand;
                person.primaryHandPointing = person.rightHandPointing;
                person.primaryHandDirection = person.rightHandDirection;

                break;

            default:

                person.primaryHandPointing = null;
                person.primaryHandDirection = null;
                person.primaryHand = null;

                break;

            }

        },

        detectGesture: function ( person ) {

            // Swipe 
            const swipe = person.gesture.swipe;

            const leftHandSwipeDetector = person.gesture.swipe.detector.leftHand;
            const rightHandSwipeDetector = person.gesture.swipe.detector.rightHand;

            const lhpScreenVector = this.mapToScreenSpace( person.leftHand );
            const rhpScreenVector = this.mapToScreenSpace( person.rightHand );

            swipe.leftHand = leftHandSwipeDetector.update( person.leftHand.z - person.torso.z, lhpScreenVector, person.hasLeftHand );
            swipe.rightHand = rightHandSwipeDetector.update( person.rightHand.z - person.torso.z, rhpScreenVector, person.hasRightHand );

            switch ( person.primaryHandLabel ) {

            case LABEL.LEFT:

                swipe.primaryHand = swipe.leftHand;
                swipe.detector.primaryHand = swipe.detector.leftHand;

                break;

            case LABEL.RIGHT:

                swipe.primaryHand = swipe.rightHand;
                swipe.detector.primaryHand = swipe.detector.rightHand;

                break;

            default:

                break;

            }

        },

        /**
         * Normalize world vector to [ -0.5 to 0.5 ]
         * @param  {object} worldVector - World vector to convert with
         * @param  {object} targetVector - Target vector to store converted xyz
         * @return {object} vector - contains xyz normalized value. z can be ignored.
         */
        normalize: function ( worldVector, targetVector ) {

            const vector = targetVector || { x: 0, y: 0, z: 0 };

            vector.x = - ( worldVector.x - this.ScreenConfig.center.x ) / this.ScreenConfig.width;
            vector.y = ( worldVector.y - this.ScreenConfig.center.y ) / this.ScreenConfig.height;
            vector.z = 0;

            return vector;

        },

        /**
         * Map world coordinate to screen coordinate
         * @param  {object} worldVector - vector in world coordinate
         * @return {object} vector - contains xyz screen coordinate. z can be ignored.
         */
        mapToScreenSpace: function ( worldVector ) {

            const vector = {};

            vector.x = -(worldVector.x - this.ScreenConfig.center.x) / this.ScreenConfig.width + 0.5;
            vector.y = 0.5 - (worldVector.y - this.ScreenConfig.center.y) / this.ScreenConfig.height;
            vector.z = -(worldVector.z - this.ScreenConfig.center.z) / this.ScreenConfig.width;

            if ( typeof window === 'undefined' ) {

                vector.x *= this.ScreenResolution.width;
                vector.y *= this.ScreenResolution.height;

            } else {

                vector.x *= window.innerWidth;
                vector.y *= window.innerHeight;

            }

            return vector;

        },

        /**
         * Map screen coordinate to world coordinate
         * @param  {object} screenVector - vector in screen coordinate
         * @return {object} vector - contains xyz world coordinate. z can be ignored.
         */
        mapFromScreenSpace: function ( screenVector ) {

            const vector = { x: screenVector.x, y: screenVector.y, z: screenVector.z };

            if ( typeof window === 'undefined' ) {

                vector.x /= this.ScreenResolution.width;
                vector.y /= this.ScreenResolution.height;

            } else {

                vector.x /= window.innerWidth;
                vector.y /= window.innerHeight;

            }        

            vector.x = this.ScreenConfig.center.x - this.ScreenConfig.width * ( vector.x - 0.5 );
            vector.y = this.ScreenConfig.center.y - this.ScreenConfig.height * ( vector.y - 0.5 );
            vector.z = 0.5;

            return vector;

        },

        getTorsoToPrimaryHandVector: function ( person ) {

            const vector = { x: 0, y: 0, z: 0 };

            switch ( person.primaryHandLabel ) {

            case LABEL.LEFT:

                vector.x = person.leftHand.x - person.torso.x;
                vector.y = person.leftHand.y - person.torso.y;
                vector.z = person.leftHand.z - person.torso.z;

                break;

            case LABEL.RIGHT:

                vector.x = person.rightHand.x - person.torso.x;
                vector.y = person.rightHand.y - person.torso.y;
                vector.z = person.rightHand.z - person.torso.z;

                break;

            default:

                break;

            }

            return vector;

        }

    } );

    function WebSocket( config, dataHandler, controller ) {

        config = config || {};
        
        this.WebsocketURL = config.hostURL || WEBSOCKET_HOST;
        this.WebsocketProtocol = config.protocol || WEBSOCKET_PROTOCOL;
        this.retryTime = config.retryTime || 2000; //ms
        
        this.DataHandler = dataHandler || {};
        this.Controller = controller;

        this.interface = {};
        this.connection = {};

    }

    Object.assign( WebSocket.prototype, {

        connect: function( websocket ) {

            if ( !this.interface && websocket ) { this.interface = websocket; }

            const DataHandler = this.DataHandler;
            const retryTime = this.retryTime;

            const WS = typeof window !== 'undefined' ? window.WebSocket : this.interface;
            const socket = new WS( this.WebsocketURL, this.WebsocketProtocol );

            socket.binaryType = 'arraybuffer';

            socket.onmessage = function ( event ) {

                const rawdata = event.data || event.utf8Data;

                if ( typeof( rawdata ) === 'object' ) {

                    const rawarray = new Float32Array( rawdata );
                    const dataView = new DataView( rawdata );
                    const purpose = dataView.getInt32( 0, true );

                    DataHandler.handleSocketDataTypeArray( purpose, rawarray, dataView );

                }

            };

            socket.onclose = function() {

                console.log( 'Websocket Connection Closed. Reconnecting...' );

                setTimeout( this.connect.bind( this ), retryTime );

            }.bind( this );

            socket.onerror = function() {

                console.log( 'Websocket Connection Error...' );

            };

            this.connection = socket;

            return this.Controller;

        },

        disconnect: function () {

            if ( this.connection ) {

                this.connection.close();
                this.connection = null;

            }

            return this.Controller;

        }

    } );

    /**
     * YS Controller
     * @param {object} config
     * ==============DataHandler==============
     * @param {Object} config.resolution
     * ===============WebSocket===============
     * @param {string} config.hostURL
     * @param {string} config.protocol
     * @param {integer} config.retryTime
     * =================Swipe=================
     * @param {object} config.swipeConfig
     */
    function Controller ( config ) {

        config = config || {};

        this.LocalServerURL = LOCAL_SERVER_HOST;
        this.DataHandler = new DataHandler( config, this );
        this.WebSocket = new WebSocket( config, this.DataHandler, this );

    }

    Controller.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

        constructor: Controller,

        connect: function( websocket ) {

            return this.WebSocket.connect( websocket );

        },

        disconnect: function() {

            return this.WebSocket.disconnect();

        },

        normalize: function( worldVector, targetVector ) {

            return this.DataHandler.normalize( worldVector, targetVector );

        },

        mapToScreenSpace: function( worldVector ) {

            return this.DataHandler.mapToScreenSpace( worldVector );

        },

        mapFromScreenSpace: function( screenVector ) {

            return this.DataHandler.mapFromScreenSpace( screenVector );

        },

        getTorsoToPrimaryHandVector: function ( person ) {

            return this.DataHandler.getTorsoToPrimaryHandVector( person );

        },

        sendMessageToServer: function ( command, value ) {

            if ( typeof window !== 'undefined' && window.XMLHttpRequest ) {

                const request = new window.XMLHttpRequest();
                request.open( 'GET', this.LocalServerURL + '?' + command + '=' + value );
                request.send();
                return request;

            }

        }

    } );

    exports.Controller = Controller;
    exports.VERSION = VERSION;
    exports.LABEL = LABEL;
    exports.STATE = STATE;
    exports.PURPOSE = PURPOSE;
    exports.WEBSOCKET_HOST = WEBSOCKET_HOST;
    exports.WEBSOCKET_PROTOCOL = WEBSOCKET_PROTOCOL;
    exports.LOCAL_SERVER_HOST = LOCAL_SERVER_HOST;
    exports.TIME = TIME;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
