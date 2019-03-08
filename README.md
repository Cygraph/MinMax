# $.MinMax

#### MinMax is a jQuery based tool to synchronize and control reponsive layout changes triggered by a window resize event or an orientation change

MinMax creates window width min max scopes defined by breakpoints. Each scope has a label, a min and a max property. The default labels are: "xs", "sm", "md", "lg", "xl". As an example the "md" scope: label: "md", min: 768, max: 1008.

If a browser resize happens and the width leaves the current scope to enter another scope, MinMax triggers the "changed" event. In case the new scope is larger than before, the "up" event will also be triggered. In case the scope is smaller, its the "down" event.

- **changed** (triggered at any scope change)
- **up**  (triggered at change to higher scope)
- **down** (triggered at change to lower scope)
- **orientated** (triggered at orientation change - "portrait" or "landscape").

Events are only triggered when the resizing action has ended for a certain time. This behaviour prevents lots of calculations. It can be tuned with the "inertia" property (milliseconds). Default is 75. Depending on your concept, values up to 400 can be good. A value of 0 would mean no inertia and normal resize event firing.

The provided event object contains informations about the resizing process. For instance orientation, aspectratio, scope, scope index and change.

MinMax can infix the coresponding label in a responsive url. Example: "images/myimg_sm.png" after "up" event: "images/myimg_md.png". Underscore is the default separator.



**Easy use**
```

var minDefs = { xs: 0, sm: 480, md: 768, lg: 1280 };

var mm = $.MinMax( minDefs );

mm.changed( handleScopeChange );

mm.up( handleScopeUp )

mm.down( handleScopeDown )

mm.orientated( handleOrientationChange );

```

**Define custom labels**. The min breakpoints are used to define the scope. This means, the first value must be 0. The last values max is set to infinity. 
```

var minDefs = { a: 0, b: 320, c: 800, d: 2000 };

/*
resulting scopes:

a: { label: "a", min: 0, max: 320 }
b: ...
c: ...
... and the last:

d: { label: "d", min: 2000, max: Infinity }


```

MinMax creates an instance you can work with over the whole project. For special cases, when different breakpoints are needed, just create a new instance. Based on jQuery's $.Callback object, the callbacks argument can be one function or an array of functions.

```

mm.changed( handleScopeChange );

mm.changed([checkLayout, resizeMenu, ... ]);

```

Unbind handler (jQuery style)
```

mm.off( "changed", handleScopeChange );


// all handlers off

mm.off( "changed" );


// all events off

mm.off();

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


Callback example
```

function handleScopeChange ( e ) {
    
    var mm = e.instance;
    
    mm.infix( imgUrl );
    
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

**Tip:** Synchronize MinMax scopes with CSS min/max breakpoints