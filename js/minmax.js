/*
File: minmax.js
Dependencies: jQuery,
Globals: none
Designer: © Michael Schwarz, CyDot, info@cydot.de
Vers. 0.9.2 
Updated: 2019-05-13
*/

;( function ( $ ) {
    
    function minMax ( breakpoints, opts_or_id ) {
        var mm = new MinMax( breakpoints, 
            $.isPlainObject( opts_or_id ) ? opts_or_id : { id: opts_or_id }
        );
        instances[ mm.id ] = mm;
        return mm;
    };
    
    minMax.get = function ( id ) {
        return instances[ id || Object.keys( instances )[ 0 ]];
    };
    
    minMax.defaults = function ( options ) {
        if ( options === undefined ) return defaults;
        
        for ( var key in options ) {
            if ( defaults[ key ] && ! key.startsWith( "_" )) {
                defaults[ key ] = options[ key ];
            }
        };
        return minMax;
    };
    
    var $win = $( window ),
    
    instCounter = 0,
    instances = {},
    
    defaults = {
        breakpoints: undefined,
        separator: "_",
        inertia: 75,
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
    
    
    function MinMax ( breakpoints, opts ) {
        
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
        return "minmax_" + ++ instCounter;
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
        
        prevIndex: {
            enumerable: true,
            get: function () {
                return this._eventObj.prevIndex;
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
        
        orientation: {
            enumerable: true,
            get: function () {
                return this._eventObj.orientation;
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
                    this._configProp( "separator", strg );
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
                    this._configProp( "inertia", millisec );
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
                    this._configProp( "autoUpdate", bool );
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
                    this._configProp( "callbacksEnabled", bool );
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
        prevIndex: null,
        change: null,
        value: null,
        ratio: null,
        prevOrientation: null,
        orientation: null
    },
    
    callbacks = {
        up: null,
        down: null,
        changed: null,
        orientated: null
    },
        
    pubMethods = {
        
        update: function () {
            var w = $win.width(), e = this._eventObj, scope;
            
            for ( var i = 0; i < this._scopes.length; i++ ) {
                scope = this._scopes[ i ];

                if ( w <= scope.max ) {
                    this._configProp( "scope", scope );
                    
                    e.value = w;
                    e.ratio = w / $win.height();
                    e.prevOrientation = e.orientation;
                    e.orientation = e.ratio > 1 ? "landscape" : "portrait";
                    e.prevIndex = e.index !== null ? e.index : i;
                    e.index = i;
                    e.change = i - e.prevIndex;
                    
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
            
            this._configProp( "entries", entries);
            this._configProp( "scopes", scopes );
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
        
        orientated: function ( callbacks ) {
            return this.on( "orientated", callbacks );
        },
        
        infix: function ( url ) {
            var parts = this._urlParts( url ),
            name = this._unfixStrg( parts.name );
            
            return ( parts.path + name + this._separator + this._scope.label + parts.suffix );
        },
        
        unfix: function ( url ) {
            var parts = this._urlParts( url ),
            name = this._unfixStrg( parts.name );
            
            return ( parts.path + name + parts.suffix );
        }
    },
    
    privMethods = {
        
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
            this._configProp( "labels", labels );
        },
        
        _checkCallbacks: function () {
            var cObj = this._callbacks;
        
            for ( var key in cObj ) {
                if ( cObj.hasOwnProperty( key ) && cObj[ key ].has()) {
                    this._configProp( "hasCallbacks", true );
                    return true;
                }; 
            };

            this._configProp( "hasCallbacks", false );
            return false;
        },
        
        _listen: function () {
            if ( ! this._listening ) {
                $win.on( "resize", this.__resizeInertia );
                this._configProp( "listening", true );
            }
        },
        
        _stopListening: function () {
            if ( this._listening ) {
                $win.off( "resize", this.__resizeInertia );
                this._configProp( "listening", false );
            }
        },
        
        _resizeInertia: function () {
            clearTimeout( this._timerID );
            this._cachedWidth = $win.width();
            
            if ( this._inertia ) {
                this._timerID = setTimeout(
                    this._hasResizeEnded.bind( this ),
                    this._inertia
                )
            }
            else this._onResized();
        },
        __resizeInertia: $.noop,
        
        _hasResizeEnded: function () {
            if ( this._cachedWidth === $win.width()) {
                this._onResized();
            }
        },
        
        _onResized: function () {
            this.update();

            if ( this._callbacksEnabled ) {
                var e = this._eventObj, cb = this._callbacks;
                
                if ( e.orientation !== e.prevOrientation && cb.orientated.has()) {
                    cb.orientated.fireWith( null, [
                        this._getEventObject( "orientated" )
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
        
        _configProp: function ( key, value ) {
            key = "_" + key;
            var def = Object.getOwnPropertyDescriptor( this, key );
            
            def.value = value;
            Object.defineProperty( this, key, def );
        },
        
        _configEventObject: function () {
            this._configProp( "eventObj", $.extend({}, eventObj ));
            this._eventObj.instance = this;
            this._eventObj.id = this.id;
        },
        
        _configCallbacks: function () {
            this._configProp( "callbacks", $.extend({}, callbacks ));
            
            for ( var key in this._callbacks ) {
                var def = Object.getOwnPropertyDescriptor( this._callbacks, key );
                
                def.writable = false;
                def.value = $.Callbacks( "unique" );
                Object.defineProperty( this._callbacks, key, def );
            };
        },
        
        _init: function ( options ) {
            this.__resizeInertia = this._resizeInertia.bind( this );
            this._configEventObject();
            this._configCallbacks();
            
            if ( options ) for ( var key in options ) {
                if ( this[ key ]) this[ key ] = options[ key ];
            };
            
            this.update();
            if ( this._autoUpdate ) {
                this._listen();
            }
        }
    };
    
    $.extend( MinMax.prototype, { constructor: MinMax }, 
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
    
    $.MinMax = minMax;
    
    // Polyfill for IE
    
    if ( ! Object.entries ) {
        Object.entries = function( obj ){
            var ownProps = Object.keys( obj ),
            i = ownProps.length,
            resArray = new Array(i);
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
            return resArray;
        };
    }
    
})( jQuery );
