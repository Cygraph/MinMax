# $.ResponsiveScopes.js

### ResponsiveScopes is a jQuery based designer tool to synchronize and control reponsive layout changes

ResponsiveScopes defines window width scopes with label, min and max properties. It's events are triggered by the window resize event. The inbuilt "inertia" function fires only after the window resizing action has been ended. You can fine tune this behaviour with the "inertia" property.

Min breakpoints are used to calculate the scopes map.

ResponsiveScopes can infix a label in a responsive url (in order to load the appropriate image size).

Callbacks can be attached to the following events: 


- **changed** (triggered at any scope change)
- **up**  (triggered at change to higher scope)
- **down** (triggered at change to lower scope)
- **formated** (triggered at format change. For instance "portrait" to "landscape").


Example

```

// First argument: array of "min" breakpoints in entry format
// Each with scope label and minimum width
// Second argument: options object or instance id

var rs = $.ResponsiveScopes([["sm"], ["md", 768], ["lg", 1280]], "rs1" );

// Call it from anywhere

var rs = $.ResponsiveScopes.get( "rs1" );

// Add callbacks

rs.up( doLoadBiggerImage );
rs.formated( doLayoutStuff );

// Same as

rs.on( "formated", doLayoutStuff );

// Removes a certain callback

rs.off( formated, doLayoutStuff );

// Removes all callbacks from formated

rs.off( formated );

// Removes all callbacks from instance rs

rs.off();

// Stops all callbacks from instance rs

rs.callbacks = false;

// Reactivates all callbacks

rs.callbacks = true;

```

### Event object properties

- **event**
- **instance**
- **id**
- **label**
- **index**
- **previousIndex**
- **change**
- **min**
- **max**
- **value**
- **format**
- **previousFormat**
- **ratio**


Example

```

function callbackFn ( e ) {
    
    var rs = e.instance;
    
    // Update responsive image source
    // Example former "images/respImg_sm.png"
    // Example later "images/respImg_lg.png"
    
    img.src = rs.infix( img.src );
    
    if ( e.format === "portrait" ) {
        doPortraitLayoutThings();
    }
    else if ( e.ratio > 1.6 ) {
        doBroadStageStuff();
    }
    
    if ( e.change > 0 && e.index === 2 ) {
        doBigChangeThings();
    }
    
    // ...
}

```

### Instance properties

- **previousIndex**:  number / getter
- **index**:  number / getter
- **change**:  number / getter
- **min**:  number / getter
- **max**:  number / getter
- **value**:  number / getter
- **format**: string / getter
- **ratio**: number / getter
- **map**:  array / getter
- **lable**:  string / getter
- **separator**:  string / getter-setter
- **inertia**:  number / getter-setter
- **autoUpdate**:  boolean / getter-setter
- **callbacks**:  boolean / getter-setter
- **hasCallbacks**:  boolean / getter


Example

```
// Modifications on the instance with setters

// Quiets all callbacks

rs.callbacks = false;

// Turns callbacks on again

rs.callbacks = true;

// Sets the inertia time for the resize event

rs.inertia = 333;

// Sets the separator for label infixes

rs.separator = "--";

```

### Instance methods

- **update()**
- **define( obj_or_array )**
- **on( type, callbacks )**
- **off( type, callbacks )**
- **changed( callbacks )**
- **up( callbacks )**
- **down( callbacks )**
- **formated( callbacks )**
- **infix( url )**
- **unfix( url )**


Example

```

// Redefine breakpoints

rs.define({ sm: 0, lg: 1008 });

// Infix label endings in an url (in this case at label "lg")

var infixed = rs.infix( "images/respImg.png" );

// infixed is then "images/respImg_lg.png"

// Same with already infixed url "images/respImg_sm.png"
// infixed is then "images/respImg_lg.png"
// It recognizes own label endings and replaces them with the current label
// By default the separator is "_". This can be changed.

```

**Tip:** Synchronize ResponsiveScopes with css min / max breakpoints