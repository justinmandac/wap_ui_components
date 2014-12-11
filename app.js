/*
    TODO:
        [ ] Figure out ABSOLUTE x series mod
        [X] Add checkmarks
        [ ] Test reload capability
            - implement internal destroy function

*/
(function ($, window, document) {
    var SIZE =150;
    $(function () {
        "use strict"
        var s1 = [];
        var s2 = [];
        var s3 = [];
      
        //generate data            
        var _date = new Date().getTime();
        for (var i = 0; i < SIZE; i++) {
            var date_tmp = (new Date( _date - (i*24*60*60*1000) ));               
            var time = Date.UTC(date_tmp.getUTCFullYear(), date_tmp.getUTCMonth(), date_tmp.getUTCDate());

            s1.push([time, Math.ceil(Math.random()*10)]);
            s2.push([time, Math.ceil(Math.random()*150)]);
            s3.push([time, Math.ceil(Math.random()*250)]);

        };

        var data = {
            "metric1" : {
                label: "Daily Sign Up Count",
                data: s1
            },
            "metric2": {
                label: "Total Sign Up Count",
                data: s2                
            },
            "metric3": {
                label: "Weekly Sign Up Count",
                data: s3                
            }
        };            

        //initialize data_set
        // colorManager binds the colors to data so that series colors remain constant when toggled 

        $.Plotter($.ColorManager(data)); //call this function when calling AJAX

    }); //DOM ready end
}(window.jQuery, window, document));