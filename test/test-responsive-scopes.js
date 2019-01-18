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
        $.MinMax.defaults({
            breakpoints: { sm: 0, md: 800, lg: 1920 }
        });
        
        console.log( "MinMax.defaults", $.MinMax.defaults());
        
        var mm1 = $.MinMax( null, "mm1" );
        
        var mm2 = $.MinMax([["sm"], ["lg", 800]], { 
            id:"mm2",
            callbacks: false
        });
        
        console.log( "MinMax 1", mm1.id, mm1.scopes );
        console.log( "MinMax 2", mm2.id, mm2.scopes );
        
        mm1.orientated( handleRSFormated );
        
        // Callbacks won't work now - callbacks is set to false
        mm2.changed( handleRSChanged );
    }
    
    function handleRSFormated ( e ) {
        console.log( "orientated", e.id, e.orientation, e );
    }
    
    function handleRSChanged ( e ) {
        console.log( "changed", e.id, e.change, e );
    }
    
    // -----------------------------------------------
    
    $( document ).ready( onDoc );
    
})( jQuery );
