/*Color Manager*/
(function ($) {

    function ColorManager(dataset) {
        var colorSet = ["#7C4B75", "#5A75CF", "#B194AD", "#5DA7EE", "#43A39E", "#D29A3C"];
        var count = 0;
        var cm = this;
        
        this.colors = colorSet; 
        
        $.each(dataset, function (key, val) {
            val.color = colorSet[count%colorSet.length];
            count++;
        });

        return dataset;
    }
    
    $.ColorManager = function(data) {
        var cm = ColorManager(data);
        return cm;
    }

})(jQuery);