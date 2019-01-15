/*
File: responsive-scopes.js
Dependencies: jQuery,
Globals: none
Designer: © Michael Schwarz, CyDot, info@cydot.de
Vers. 0.8.1 
Updated: 2019-01-15

-------------------------------------------

ResponsiveScopes is a designer tool for managing responsive layout scripts.

-------------------------------------------

ResponsiveScopes defines window width scopes with label, min and max properties. It's events are triggered by the window resize event. The inbuilt "inertia" function fires only after the window resizing action has been ended. You can fine tune this behaviour with the "inertia" property. Callbacks can be attached to BreakSpace events. 

- changed (from one space to another)
- up  (changed to higher space)
- down (changed to lower space)
- formated (changed format. For instance "portrait" to "landscape").

ResponsiveScopes can infix a label in an url, in order to load the appropriate image size.

ResponsiveScopes private properties are protected and can not coincidently be overwritten by an assignment operator. It uses JQuery and has no further script dependencies.

-------------------------------------------

Tip: Synchronize ResponsiveScopes with css min / max breakpoints in order to consistently manage responsive layouts.

-------------------------------------------

Instance properties:

previousIndex:  number / getter
index:  number / getter
change:  number / getter
min:  number / getter
max:  number / getter
value:  number / getter
format: string / getter
ratio: number / getter
scopes:  array / getter
lable:  string / getter
separator:  string / getter-setter
inertia:  number / getter-setter
autoUpdate:  boolean / getter-setter
callbacks:  boolean / getter-setter
hasCallbacks:  boolean / getter

Instance methods:

update()
define( obj_or_array )
on( type, callbacks )
off( type, callbacks )
changed( callbacks )
up( callbacks )
down( callbacks )
formated( callbacks )
infix( url )
unfix( url )

Event object properties:

previousIndex
index
change
min
max
value
previousFormat
format
ratio
label
id
instance

------------------------------------------- */

;( function ( $ ) {
    
    function responsiveScopes ( breakpoints, opts_or_id ) {
        var b = new ResponsiveScopes( breakpoints, 
            $.isPlainObject( opts_or_id ) ? opts_or_id : { id: opts_or_id }
        );
        instances[ b.id ] = b;
        return b;
    };
    
    responsiveScopes.get = function ( id ) {
        return instances[ id || Object.keys( instances )[ 0 ]];
    };
    
    responsiveScopes.defaults = function ( options ) {
        if ( options === undefined ) return defaults;
        
        for ( var key in options ) {
            if ( defaults[ key ] && ! key.startsWith( "_" )) {
                defaults[ key ] = options[ key ];
            }
        };
        return responsiveScopes;
    };
    
    var $win = $( window ),
    
    instCounter = 0,
    instances = {},
    
    defaults = {
        breakpoints: undefined,
        separator: "_",
        inertia: 400,
        autoUpdate: true,
        callbacks: true
    },
    
    defaultBreakpoints = [
        ["xs"],["sm", 480],["md", 768],["lg", 1008],["xl", 1280]
    ],
        
    defaultDefs = {
        breakpoints: {
            enumerable: true,
            get: function () {
                return defaultBreakpoints;
            },
            set: function ( entries ) {
                if ( $.isPlainObject( entries )) {
                    entries = Object.entries( entries );
                }
                else if ( ! $.isArray( entries )) {
                    return;
                };
                defaultBreakpoints = entries;
            }
        }
    };
    
    Object.defineProperties( defaults, defaultDefs ); 
    
    
    function ResponsiveScopes ( breakpoints, opts ) {
        
        Object.defineProperty( this, "id", { 
            enumerable: true,
            value: opts && opts.id ? opts.id : createID()
        });
        
        Object.defineProperties( this, propDefs );
        
        this._cachedWidth = null;
        this._timerID = null;
        
        this.define( breakpoints || defaults.breakpoints );
        this._init( opts );
    }
    
    function createID () {
        return "rscopes_" + ++ instCounter;
    }
    
    var propDefs = {
        
        label: {
            enumerable: true,
            get: function () {
                return this._scope.label;
            }
        },
        
        min: {
            enumerable: true,
            get: function () {
                return this._scope.min;
            }
        },
        
        max: {
            enumerable: true,
            get: function () {
                return this._scope.max;
            }
        },
        
        index: {
            enumerable: true,
            get: function () {
                return this._eventObj.index;
            }
        },
        
        previousIndex: {
            enumerable: true,
            get: function () {
                return this._eventObj.previousIndex;
            }
        },
        
        change: {
            enumerable: true,
            get: function () {
                return this._eventObj.change;
            }
        },
        
        value: {
            enumerable: true,
            get: function () {
                return this._eventObj.value;
            }
        },
        
        format: {
            enumerable: true,
            get: function () {
                return this._eventObj.format;
            }
        },
        
        ratio: {
            enumerable: true,
            get: function () {
                return this._eventObj.ratio;
            }
        },
        
        scopes: {
            enumerable: true,
            get: function () {
                return this._scopes ? this._scopes.slice( 0 ) : undefined;
            }
        },
        
        _scopes: { configurable: true },
        
        separator: {
            enumerable: true,
            get: function () {
                return this._separator;
            },
            set: function ( strg ) {
                if ( typeof strg == "string" ) {
                    this._setPriv( "separator", strg );
                }
            }
        },
        
        _separator: {
            configurable: true,
            value: defaults.separator
        },
        
        inertia: {
            enumerable: true,
            get: function () {
                return this._inertia;
            },
            set: function ( millisec ) {
                if ( typeof millisec === "number" && millisec !== null ) {
                    this._setPriv( "inertia", millisec );
                }
            }
        },
        
        _inertia: {
            configurable: true,
            value: defaults.inertia
        },
        
        autoUpdate: {
            enumerable: true,
            get: function () {
                return this._autoUpdate;
            },
            set: function ( bool ) {
                if ( typeof bool === "boolean" ) {
                    if ( bool ) {
                        this._listen();
                        this.update();
                    }
                    else {
                        if ( ! this._hasCallbacks || ! this._callbacksEnabled ) {
                            this._stopListening();
                        };
                    };
                    this._setPriv( "autoUpdate", bool );
                }
            }
        },
        
        _autoUpdate: { 
            configurable: true,
            value: defaults.autoUpdate 
        },
        
        callbacks: {
            enumerable: true,
            get: function () {
                return this._callbacksEnabled;
            },
            set: function ( bool ) {
                if ( typeof bool === "boolean" ) {
                    if ( bool && ! this._callbacksEnabled ) {
                        if ( this._hasCallbacks ) {
                            this._listen();
                        }
                    }
                    else if ( this._callbacksEnabled ) {
                        if ( ! this._autoUpdate ) {
                            this._stopListening();
                        }
                    };
                    this._setPriv( "callbacksEnabled", bool );
                }
            }
        },
        
        _callbacksEnabled: {
            configurable: true,
            value: defaults.callbacks
        },
        
        hasCallbacks: {
            enumerable: true,
            get: function () {
                return this._hasCallbacks;
            }
        },
        
        _hasCallbacks: {
            configurable: true,
            value: false
        },
        
        _callbacks: { configurable: true },
        
        _listening: {
            configurable: true,
            value: false
        },
        
        _eventObj: { configurable: true },
        
        _scope: { configurable: true },
        
        _entries: {
            configurable: true,
            value: defaults.breakpoints
        },
        
        _labels: { configurable: true }
    },
    
    eventObj = {
        index: null,
        previousIndex: null,
        change: null,
        value: null,
        ratio: null,
        previousFormat: null,
        format: null
    },
    
    callbacks = {
        up: null,
        down: null,
        changed: null,
        formated: null
    },
        
    pubMethods = {
        
        update: function () {
            var w = $win.width(), e = this._eventObj, scope;
            
            for ( var i = 0; i < this._scopes.length; i++ ) {
                scope = this._scopes[ i ];

                if ( w <= scope.max ) {
                    this._setPriv( "scope", scope );
                    
                    e.value = w;
                    e.ratio = w / $win.height();
                    e.previousFormat = e.format;
                    e.format = e.ratio > 1 ? "landscape" : "portrait";
                    e.previousIndex = e.index !== null ? e.index : i;
                    e.index = i;
                    e.change = i - e.previousIndex;
                    
                    return this;
                }
            };
            return this;
        },
        
        define: function ( entries ) {
            if ( $.isPlainObject( entries )) {
                entries = Object.entries( entries );
            }
            else if ( ! $.isArray( entries )) {
                return this;
            };
            
            var scopes = this._createScopes( entries );
            
            this._setPriv( "entries", entries);
            this._setPriv( "scopes", scopes );
            this._updateLabels();
            
            return this;
        },
        
        on: function ( type, callbacks ) {
            var cbs = this._callbacks[ type ];
        
            if ( cbs && callbacks ) {
                if ( this._callbacksEnabled ) {
                    this._listen();
                };

                cbs.add( callbacks );
                this._checkCallbacks();
            };
            return this;
        },
        
        off: function ( type, callbacks ) {
            var cObj = this._callbacks;
            
            if ( type ) {
                var cbs = cObj[ type ];

                if ( cbs ) {
                    if ( callbacks ) cbs.remove( callbacks );
                    else cbs.empty();
                }
            }
            else {
                for ( var key in cObj ) {
                    if ( cObj.hasOwnProperty( key )) {
                        cObj[ key ].empty();
                    } 
                }
            }
            if ( ! this._checkCallbacks()) {
                if ( ! this._autoUpdate ) {
                    this._stopListening();
                }
            };
            return this;
        },
        
        up: function ( callbacks ) {
            return this.on( "up", callbacks );
        },
        
        down: function ( callbacks ) {
            return this.on( "down", callbacks );
        },
        
        changed: function ( callbacks ) {
            return this.on( "changed", callbacks );
        },
        
        formated: function ( callbacks ) {
            return this.on( "formated", callbacks );
        },
        
        infix: function ( url ) {
            var parts = this._urlParts( url ),
            name = this._unfixStrg( parts.name );
            
            return ( parts.path + name + this._separator + this._label + parts.suffix );
        },
        
        unfix: function ( url ) {
            var parts = this._urlParts( url ),
            name = this._unfixStrg( parts.name );
            
            return ( parts.path + name + parts.suffix );
        }
    },
    
    privMethods = {
        
        _setPriv: function ( key, value ) {
            key = "_" + key;
            var def = Object.getOwnPropertyDescriptor( this, key );
            
            def.value = value;
            Object.defineProperty( this, key, def );
        },
        
        _createScopes: function ( entries ) {
            var scopes = [],
            len = entries.length;
            
            entries.sort( function ( a, b ) {
                if ( ! a[ 1 ] || a[ 1 ] < b[ 1 ]) return -1;
                if ( a[ 1 ] > b[ 1 ]) return 1;
                return 0;
            });
            
            entries[ 0 ][ 1 ] = 0;
            
            for ( var i = 0; i < len; i ++ ) {
                scopes[ i ] = new Scope(
                    entries[ i ][ 0 ],
                    entries[ i ][ 1 ],
                    i < len - 1 ? entries[ i + 1 ][ 1 ] - 1 : Infinity
                );
            };
            return scopes;
        },
        
        _updateLabels: function () {
            var labels = [];
            
            for ( var i = 0; i < this._scopes.length; i ++ ) {
                labels.push( this._scopes[ i ].label );
            };
            this._setPriv( "labels", labels );
        },
        
        _checkCallbacks: function () {
            var cObj = this._callbacks;
        
            for ( var key in cObj ) {
                if ( cObj.hasOwnProperty( key ) && cObj[ key ].has()) {
                    this._setPriv( "hasCallbacks", true );
                    return true;
                }; 
            };

            this._setPriv( "hasCallbacks", false );
            return false;
        },
        
        _listen: function () {
            if ( ! this._listening ) {
                $win.on( "resize", this.__initStateOfInertia );
                this._setPriv( "listening", true );
            }
        },
        
        _stopListening: function () {
            if ( this._listening ) {
                $win.off( "resize", this.__initStateOfInertia );
                this._setPriv( "listening", false );
            }
        },
        
        _initStateOfInertia: function () {
            clearTimeout( this._timerID );
            this._cachedWidth = $win.width();
            
            if ( this._inertia ) {
                this._timerID = setTimeout(
                    this._hasResizeEnded.bind( this ),
                    this._inertia
                )
            }
            else this._handleResized();
        },
        __initStateOfInertia: $.noop,
        
        _hasResizeEnded: function () {
            if ( this._cachedWidth === $win.width()) {
                this._handleResized();
            }
        },
        
        _handleResized: function () {
            this.update();

            if ( this._callbacksEnabled ) {
                var e = this._eventObj, cb = this._callbacks;
                
                if ( e.format !== e.previousFormat && cb.formated.has()) {
                    cb.formated.fireWith( null, [
                        this._getEventObject( "formated" )
                    ]);
                }
                if ( e.change && cb.changed.has()) {
                    cb.changed.fireWith( null, [
                        this._getEventObject( "changed" )
                    ]);
                }
                if ( e.change > 0 && cb.up.has()) {
                    cb.up.fireWith( null, [
                        this._getEventObject( "up" )
                    ]);
                }
                else if ( e.change < 0 && cb.down.has()) {
                    cb.down.fireWith( null, [
                        this._getEventObject( "down" )
                    ]);
                }
            }
        },
        
        _getEventObject: function ( type ) { 
            var e = $.extend({}, this._eventObj, this._scope );
            e.event = type;
            
            return e;
        },
        
        _urlParts: function ( url ) {
            var i = url.lastIndexOf( "/"),
            path = "", name = "", suffix = "";
            
            if ( i > -1 ) {
                path = url.substr( 0, i + 1 );
                name = url.substr( i + 1 );
            }
            else name = url;
            
            i = name.lastIndexOf( "." );
            
            if ( i > -1 ) {
                suffix = name.substr( i );
                name = name.substr( 0, i );
            };
            
            return {
                path: path,
                name: name,
                suffix: suffix
            }
        },
        
        _unfixStrg: function ( strg ) {
            i = strg.lastIndexOf( this._separator ) + 1;
            
            if ( i ) {
                var ending = strg.substr( i );

                if ( this._labels.indexOf( ending ) > -1 ) {
                    strg = strg.substr( 0, i - 1 );
                }
            };
            return strg;
        },
        
        _configEventObject: function () {
            this._setPriv( "eventObj", $.extend({}, eventObj ));
            this._eventObj.instance = this;
            this._eventObj.id = this.id;
        },
        
        _configCallbacks: function () {
            this._setPriv( "callbacks", $.extend({}, callbacks ));
            
            for ( var key in this._callbacks ) {
                var def = Object.getOwnPropertyDescriptor( this._callbacks, key );
                
                def.writable = false;
                def.value = $.Callbacks( "unique" );
                Object.defineProperty( this._callbacks, key, def );
            };
        },
        
        _init: function ( options ) {
            this.__initStateOfInertia = this._initStateOfInertia.bind( this );
            this._configEventObject();
            this._configCallbacks();
            
            if ( options ) for ( var key in options ) {
                if ( this[ key ]) this[ key ] = options[ key ];
            };
            
            this.update();
        }
    };
    
    $.extend( ResponsiveScopes.prototype, { constructor: ResponsiveScopes }, 
        pubMethods, privMethods 
    );
    
    
    function Scope ( label, min, max ) {
        Object.defineProperty( this, "label", {
            enumerable: true,
            value: label
        });
        Object.defineProperty( this, "min", {
            enumerable: true,
            value: min
        });
        Object.defineProperty( this, "max", {
            enumerable: true,
            value: max
        });
    }
    
    
    $.ResponsiveScopes = responsiveScopes;
    
})( jQuery );
