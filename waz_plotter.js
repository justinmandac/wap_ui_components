/*HARRY PLOTTER*/
(function ($) {
    /*UTILITY FUNCTIONS AND CALLBACKS*/
    
    //separates a series' x and y  points into two arrays and acquires datapoints between min and max. 
    function splitArray(arr, step, max, min) {
        "use strict"
        var pair = {
            x : [],
            y : []
        };

        //get timestamps which are found on 'step' increments in arr. 
        //associated values are found on 'step' + 1  increments
        for (var i = 0; i < arr.length; i+=step) {
            var val = arr[i];
            if(val >= min && val < max) {
                pair.x.push(val);
                pair.y.push(arr[arr.indexOf(val)+1]);                    
            }
        }
        return pair;
    };

    //flot hook executed after chart and series have been drawn onto the canvas. 
    //draw markers for each series indicating the value of the highest datapoint
    function drawMarkers(plot, ctx) {
        "use strict"
        var tmp, maxIndex;
        var xMin = plot.getOptions().xaxis.min;
        var xMax = plot.getOptions().xaxis.max;
        var px   = plot.getAxes().xaxis;
        var py   = plot.getAxes().yaxis;
        var canvas = $(plot.getCanvas());
        var ctx = canvas[0].getContext('2d');    
        var offset = plot.getPlotOffset();
        var radius = 10;
        var dx, dy; //coordinates of highest point
        var sx, sy; // coordinates of indicator shape
        var max;   //maximum value of series at set timeframe
        //indicator dimensions
        var IND_HEIGHT = 24; 
        var IND_WIDTH = 30;
        var textOffset_x = 0; //indicator text horizontal offset

        //draw indicator for each series   
        $.each(plot.getData(), function (i, val) {
            tmp = splitArray(val.datapoints.points, val.datapoints.pointsize, xMax, xMin);
            //acquire the index of the highest value for each series
            maxIndex = tmp.y.indexOf(Math.max.apply(Math, tmp.y)); 
            max = tmp.y[maxIndex];
            //transform data point x & y values to canvas coordinates
            dx = px.p2c(tmp.x[maxIndex]) + offset.left;
            dy = py.p2c(tmp.y[maxIndex]) + offset.top - 12;
            sx = dx + 2;
            sy = dy - 22;

            //draw indicator
            ctx.beginPath(); 
            ctx.moveTo(sx, sy + IND_HEIGHT);
            ctx.lineTo(sx, sy + 30);
            ctx.lineTo(sx + 5, sy + IND_HEIGHT);
            ctx.closePath();
            ctx.fillStyle = val.color;  

            //set horizontal text offset based on value. 
            /*
                TODO:
                    Make this more robust - base length adjustment on number of chars instead
            */
            if (max < 10) {
                textOffset_x = 12;
            }
            else if (max >= 10 && max < 100) {
                textOffset_x = 8;
            }
            else if (max >= 100 && max <= 1000) {
                textOffset_x = 4;
            }

            ctx.rect(sx,sy, IND_WIDTH, IND_HEIGHT);
            ctx.fillStyle = val.color;  
            ctx.fill();    

            ctx.fillStyle = '#fff'                        
            ctx.font = '11pt Calibri';
            ctx.fillText(max, sx + textOffset_x ,sy + 16 );                    
        });
    };       
    
    //generates legend cum series toggle
    function generateLegendToggle(container, data) {
        var cbStr = '<li><div class="seriesCB"><input type="checkbox" checked id="{id}_cb" name="{id}"><label class="lab" for="{id}_cb" data-color="{color}"><span></span></label><span>{label}</span></div></li>'; 
        var append_str = '';
        container.html('');
        //generate checkboxes for each series
        $.each( data , function (key, val) {
            append_str+=cbStr.replace(/\{id\}/g, key).replace(/\{label}/g, val.label).replace(/\{color}/g, val.color);
            
        });  
        container.append(append_str);
    }
    
    /*MAIN*/
    function Plotter(dataset) {
        "use strict"
        var _data = []; //copy complete data.
        $.each(dataset, function(key, val) {
            _data.push(val);
        });
        
        var plot_container = $('#plot-container');
        var time_container = $('#time-select');   
        var series_container = $('#series-list');
        
        var _date = (new Date).getTime();
        var multiplier = 24*60*60*1000;
        
        var options =  {
            grid: {
                borderWidth: 1,
                borderColor: "rgb(0,0,0,.1)",
                hoverable:true
            },
            lines: {
                show: true,
                lineWidth: 2.5
            },
            points: {
                show: true,
                fill: true,
                radius: 1.5
            },
            xaxis: {
                mode: "time",
                minTickSize: [1,"day"],
                min: (new Date(_date - 7*multiplier)).getTime(),
                max: (new Date(_date + 1*multiplier)).getTime()    
            },
            yaxis :{
                show: true,
                autoscaleMargin: .1
            },
            legend: {
                show: false
            },
            shadowSize: 0,
            hooks: {
                draw: [drawMarkers]
            }
        };  
        var tooltip_opts = {
            position: "absolute",
            display: "none",
            border: "1px solid #fdd",
            padding: "2px",
            "background-color" : "#fee",
            "font-size": ".7em",
            opacity: 0.80
        };
        
        var tooltip_html = '<div id="tooltip"></div>';
        var plotter = this;
        var plot_obj  = $.plot(plot_container, _data, options);

        //expose variables
        this.plot = plot_obj;
        this.options = options; 
        this.placeholder = plot_container;
        this.time_placeholder = time_container;        
        this.data = plot_obj.getData();
           
        generateLegendToggle(series_container, dataset);
        
        //initialize colors
        $.each(series_container.find('input:checked'), function () {
            var lab = $($(this).next());
            lab.css('background', lab.attr('data-color'));
        });
        //event bindings
        plot_container.bind('plothover', function (event, pos, item) {
            if (item) {
                var x = new Date(item.datapoint[0]).toDateString();
                var	y = item.datapoint[1].toFixed(2);

                $("#tooltip").html(item.series.label + " of " + x + " = " + y)
                    .css({top: item.pageY+5, left: item.pageX+5})
                    .fadeIn(200);
            } else {
                $("#tooltip").hide();
            }

        });            

        time_container.change(function () {
            "use strict"
            var selection = this.value;
            var days; 
            var tick;

            switch (selection) {
                case "7D": 
                days = 7;
                tick = [1,"day"];
                break;
                case "30D":
                days = 30;
                tick = [7,"day"];
                break;
                case "90D":
                days = 90;
                tick = [7,"day"];
                break;
            };

        options.xaxis.minTickSize = tick;
        options.xaxis.min = (new Date((new Date).getTime() - (days*multiplier))).getTime();

        plotter.plot = $.plot(plot_container, _data, options); //redraw plot    
        //redraw legend
        });            

        series_container.find('input').click(function () {
            var set = [];
           // console.log('yo');
            series_container.find('input:checked').each(function () {
                var lab = $($(this).next());
                var key = $(this).attr('name');
                lab.css('background', lab.attr('data-color'));
                $(lab.children()[0]).css('display', 'block');
                if(key && dataset[key]) {
                    set.push(dataset[key]);
                }     
                
            });

            if( set.length > 0) {
                plotter.plot = $.plot(plot_container, set, options); //redraw plot    
                _data = set;
            series_container.find('input:not(:checked)').each(function () {
                 var lab = $($(this).next());
                 lab.css('background', '#ccc');
                 $(lab.children()[0]).css('display', 'none');
            });                
            }
        });        

         $(tooltip_html).css(tooltip_opts).appendTo("body");  
    };
    //register Plotter to the global namespace
    $.Plotter = function(data) {
        var plotter = new Plotter(data);

        return plotter;
    };
    
})(jQuery);