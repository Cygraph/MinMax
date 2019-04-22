# $.MinMax
Version 0.9.1

#### MinMax is a jQuery based tool to synchronize and control reponsive layout changes triggered by a window resize event or an orientation change

MinMax creates window width min max scopes defined by breakpoints. Each scope has a label, a min and a max property. The default labels are: "xs", "sm", "md", "lg", "xl". As an example the "md" scope: label: "md", min: 768, max: 1008.

If a browser resize happens and the width leaves the current scope to enter another scope, MinMax triggers the "changed" event. In case the new scope is larger than before, the "up" event will also be triggered. In case the scope is smaller, its the "down" event.

- **changed** (triggered at any scope change)
- **up**  (triggered at change to higher scope)
- **down** (triggered at change to lower scope)
- **orientated** (triggered at orientation change - "portrait" or "landscape").

Events are only triggered when the resizing action has ended for a certain time. This behaviour prevents lots of calculations. It can be tuned with the "inertia" property (milliseconds). Default is 75. Depending on your concept, values up to 400 can be good. A value of 0 would mean no inertia and normal resize event firing.

The provided event object contains informations about the resizing process. For instance orientation, aspectratio, scope, scope index and change.

MinMax can infix the corresponding label in a responsive url. Example: "images/myimg_sm.png" after "up" event: "images/myimg_md.png". Underscore is the default separator.



**Easy use**
```

var minDefs = { xs: 0, sm: 480, md: 768, lg: 1280 };

var mm = $.MinMax( minDefs );

mm.changed( handleScopeChange );

mm.up( handleScopeUp )

mm.down( handleScopeDown )

mm.orientated( handleOrientationChange );

```

**Define custom labels**. The min breakpoints are used to define the scope. This means, the first value must be 0. The last value of max is set to infinity. 
```

// Scope definition
{ a: 0, b: 800, c: 2000 };

/*
Resulting scopes:

a: { label: "a", min: 0, max: 799 }
b: { label: "b", min: 800, max: 1999 }
c: { label: "c", min: 2000, max: Infinity }
*/

```

**Callbacks**. MinMax creates an instance you can work with over the whole project. For special cases, when different breakpoints are needed, just create a new instance. Based on jQuery's $.Callback object, the callbacks argument can be one function or an array of functions.

```

mm.changed( handleScopeChange );

mm.changed([checkLayout, resizeMenu, ... ]);

```

**Unbind handler** (jQuery style)
```

mm.off( "changed", handleScopeChange );


// all handlers off

mm.off( "changed" );


// all events off

mm.off();

```

### Event object properties

- **event** - string
- **instance** - object
- **id** - string
- **label** - string
- **index** - number
- **prevIndex** - number
- **change** - number
- **min** - number
- **max** - number
- **value** - number
- **orientation** - string
- **prevOrientation** - string
- **ratio** - number


**Callback example**
```

function handleScopeChange ( e ) {
    
    var mm = e.instance;
    
    myImg.src = mm.infix( imgUrl );
    
    if ( e.index < 2 ) {
        doMobileThings();
        console.log( "orientation", e.orientation, e.ratio );
    }
    
    if ( Math.abs( e.change > 1 )) {
        doBigChangeThings();
    }
    
    if ( e.ratio < 1 )) {
        doPortraitThings();
    }
    else doLandscapeThings();
    
    // ...
}

```

In the example above the "infix" method of the instance is used to switch the url and get the right image. MinMax has various instance methods.

### Basic methods

- **update()** - returns instance
- **define( breakpoints )** - returns instance
- **infix( url )** - returns infixed url
- **unfix( url )** - returns unfixed url

### Callback methods

- **on( event, callbacks )** - returns instance
- **off( event, callbacks )** - returns instance
- **up( callbacks )** - returns instance
- **down( callbacks )** - returns instance
- **changed( callbacks )** - returns instance
- **orientated( callbacks )** - returns instance


Further the instance has setter/getter methods on properties. In general they reflect the event object properties (listed above). Plus some more.

### Setter/Getter

- **label** - Getter - String
- **min** - Getter - Number
- **max** - Getter - Number
- **index** - Getter - Number
- **prevIndex** - Getter - Number
- **change** - Getter - Number
- **value** - Getter - Number
- **orientation** - Getter - String
- **ratio** - Getter - Number
- **scopes** - Getter - Array
- **separator** - Getter/Setter - String
- **inertia** - Getter/Setter - Number
- **autoUpdate** - Getter/Setter - Boolean
- **callbacks** - Getter/Setter - Boolean
- **hasCallbacks** - Getter - Boolean

**Tip:** Synchronize MinMax scopes with CSS min/max breakpoints and :)