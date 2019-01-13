/*
test-breakspaces.js
Designer: © Michael Schwarz, CyDot
Updated: 2019-01-09
*/


( function ( $ ) {
    
    var $win = $( window ),
    url = "images/test_1_sm.png";
    
    
    // M A I N - E V E N T S -------------------------------
    
    function onDoc () { 
        $.ResponsiveScopes.defaults({
            breakpoints: { sm: 0, md: 800, lg: 1920 }
        });
        
        console.log( "ResponsiveScopes.defaults", $.ResponsiveScopes.defaults());
        
        var r1 = $.ResponsiveScopes( null, "r1" );
        
        var r2 = $.ResponsiveScopes([["sm"], ["lg", 800]], { 
            id:"r2",
            callbacks: false
        });
        
        console.log( "ResponsiveScopes 1", r1.id, r1.map );
        console.log( "ResponsiveScopes 2", r2.id, r2.map );
        
        r1.formated( handleRSFormated );
        
        // Callbacks won't work now - callbacks is set to false
        r2.changed( handleRSChanged );
    }
    
    function handleRSFormated ( e ) {
        console.log( "formated", e.id, e.format, e );
    }
    
    function handleRSChanged ( e ) {
        console.log( "changed", e.id, e.change, e );
    }
    
    // -----------------------------------------------
    
    $( document ).ready( onDoc );
    
})( jQuery );
