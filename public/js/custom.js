$(function () {
    //====================================
    //set stripe public key
    //====================================
    Stripe.setPublishableKey('pk_test_mHPxSkqwHHe1BTP4AueAwNUV');


    //====================================
    //spin
    //====================================
    var opts = {
        lines: 13 // The number of lines to draw
        , length: 28 // The length of each line
        , width: 14 // The line thickness
        , radius: 42 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0.25 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 60 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    }








    //====================================
    //search functionality
    //====================================
   $('#search').keyup(function () {
       var search_term = $(this).val();

       $.ajax({
           method: 'POST',  //whenever type in, keep sending post request to server
           url: 'api/search',
           data: {
               search_term
           },
           dataType: 'json',
           success: function (json) {
               var data = json.hits.hits.map(function (hit) {  //map: store hit.hits中的数组到new array
                       return hit;
               });

               $('#searchResults').empty();  //有输入就empty
               for(var i=0; i<data.length; i++){
                   var html = '';  //改变html
                   html += '<div class="col-sm-4">';
                   html += '<a href="/product/'+data[i]._id + '">';
                   html += '<div class="thumbnail">';
                   html += '<img src="' + data[i]._source.image + '">';
                   html += '<div class="caption">';
                   html += '<h3>' + data[i]._source.name+'</h3>';
                   html += '<p>'+ data[i]._source.category.name + '</p>';
                   html += '<p>$' + data[i]._source.price + '</p></div></div></a></div>';
                    console.log(data);
                    console.log(html);
                   $('#searchResults').append(html);
               }
           },
           error: function (error) {
               console.log(err);
           }
       });
   });

    //====================================
    // add and minus functionality
    //====================================
    $(document).on('click', '#plus', function (e) {
        e.preventDefault();  //prevent refreshing the page
        var priceValue = parseFloat($('#priceValue').val());
        var quantity = parseInt($('#quantity').val());
        priceValue += parseFloat($('#priceHidden').val()); //原价基础上增加一次单价
        quantity += 1;  //原数量基础上增加1个
        //reset 当前数量和价格
        $('#quantity').val(quantity);  //replace hiddenQuantity with the new quantity value
        $('#priceValue').val(priceValue.toFixed(2));
        $('#count').html(quantity); //show to user what is the current quantity
    });

    $(document).on('click', '#minus', function (e) {
        e.preventDefault();  //prevent refreshing the page
        var priceValue = parseFloat($('#priceValue').val());
        var quantity = parseInt($('#quantity').val());

        if(quantity === 1){  //防止减为负数
            priceValue = $('#priceHidden').val();
            quantity = 1;
        }else{
            priceValue -= parseFloat($('#priceHidden').val()); //原价基础上增加
            quantity -= 1;  //原数量基础上增加
        }
        $('#quantity').val(quantity);  //replace hiddenQuantity with the new quantity value
        $('#priceValue').val(priceValue.toFixed(2));
        $('#count').html(quantity); //show to user what is the current quantity
    });

    //====================================
    //Create a single use token
    //====================================
    var $form = $('#payment-form');
    $form.submit(function(event) {
        // Disable the submit button to prevent repeated clicks:
        $form.find('.submit').prop('disabled', true);

        // Request a token from Stripe:
        Stripe.card.createToken($form, stripeResponseHandler);

        // Prevent the form from being submitted:
        return false;
    });

     //====================================
     //Sending the form to your server
     //====================================
     function stripeResponseHandler(status, response) {
       // Grab the form:
       var $form = $('#payment-form');

       if (response.error) { // Problem!

         // Show the errors on the form:
         $form.find('.payment-errors').text(response.error.message);
         $form.find('.submit').prop('disabled', false); // Re-enable submission

       } else { // Token was created!
                //response contains id and card, which contains additional card details

         // Get the token ID:
         var token = response.id;

         // Insert the token ID into the form so it gets submitted to the server:
         $form.append($('<input type="hidden" name="stripeToken">').val(token));

         //use spinner
         var spinner = new Spinner(opts).spin();
         $('#loading').append(spinner.el);


         // Submit the form:
         $form.get(0).submit();
       }
     };
});