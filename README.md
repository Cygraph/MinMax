# $.MinMax

### MinMax is a jQuery based designer tool to synchronize and control reponsive layout changes

MinMax defines scopes with label, min and max properties. It's events are triggered by the window resize event. The inbuilt "inertia" function fires only after the window resizing action has been ended. You can fine tune this behaviour with the "inertia" property.

Min breakpoints are used to calculate the scopes.
MinMax can infix a label in a responsive url.
Callbacks can be attached to the following events: 


- **changed** (triggered at any scope change)
- **up**  (triggered at change to higher scope)
- **down** (triggered at change to lower scope)
- **orientated** (triggered at orientation change - "portrait" or "landscape").


```

// First argument: array of "min" breakpoints in entry or object format
// Second argument: options object or instance id

var breakpoints = { xs: 0, sm: 480, md: 768, lg: 1280 };

var mm = $.MinMax( breakpoints, "mm1" );

mm.changed( handleScopeChange );

mm.up( handleScopeUp )

mm.orientated( handleOrientationChange );

```

### Event object properties

- **event**
- **instance**
- **id**
- **label**
- **index**
- **prevIndex**
- **change**
- **min**
- **max**
- **value**
- **orientation**
- **prevOrientation**
- **ratio**


Callback

```

function handleScopeChange ( e ) {
    
    var mm = e.instance;
    
    // Update responsive image source
    // Example former "images/respImg_sm.png"
    // Example later "images/respImg_lg.png"
    
    img.src = mm.infix( img.src );
    
    if ( e.index < 2 ) {
        doMobileThings();
        console.log( "orientation", e.orientation, e.ratio );
    }
    
    if ( Math.abs( e.change > 1 )) {
        doBigChangeThings();
    }
    
    // ...
}

function handleScopeUp ( e ) {
    
    if ( e.index === 3 ) {
        console.log( "label", e.label );
    }
    
    if ( e.prevIndex < 2 && e.change > 1 ) {
        console.log( "can happen", e.change );
    }
    
    // ...
}

function  handleOrientationChange ( e ) {
    
    if ( e.orientation === "portrait" ) {
        doPortraitLayoutThings();
    }
    else if ( e.ratio > 1.6 ) {
        doBroadLandscapeThings();
    }
    
    // ...
}

```

### Instance properties

- **prevIndex**:  number / getter
- **index**:  number / getter
- **change**:  number / getter
- **min**:  number / getter
- **max**:  number / getter
- **value**:  number / getter
- **orientation**: string / getter
- **ratio**: number / getter
- **scopes**:  array / getter
- **lable**:  string / getter
- **separator**:  string / getter-setter
- **inertia**:  number / getter-setter
- **autoUpdate**:  boolean / getter-setter
- **callbacks**:  boolean / getter-setter
- **hasCallbacks**:  boolean / getter

### Instance methods

- **update()**
- **define( obj_or_array )**
- **on( type, callbacks )**
- **off( type, callbacks )**
- **changed( callbacks )**
- **up( callbacks )**
- **down( callbacks )**
- **orientated( callbacks )**
- **infix( url )**
- **unfix( url )**

**Tip:** Synchronize MinMax with css min / max breakpoints