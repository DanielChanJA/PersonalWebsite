/**
 * Created by Daniel Chan on 7/4/2017.
 */
$(document).ready(function() {
    $("#js-rotating").Morphext();


    $("a").on('click', function(event) {

        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){

                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });


    // Specific animations for About Me section.
    $("#introduction").whenInViewport(function() {
       $("#introduction").addClass("animated fadeInDown");
    });

    $("#descriptionAbout").whenInViewport(function() {
        $("#descriptionAbout").addClass("animated slideInRight");
    });

    $("#profile-photo-div").whenInViewport(function() {
        $("#profile-photo-div").addClass("animated slideInLeft");
    });



    // Specific animations for Project section.

    $("#project-intro").whenInViewport(function() {
        $("#project-intro").addClass("animated fadeInDown");
    });

    $("#burstvpn-card").whenInViewport(function() {
        $("#burstvpn-card").addClass("animated slideInLeft");
    });

    $("#schedulr-card").whenInViewport(function() {
        $("#schedulr-card").addClass("animated slideInUp");
    });

    $("#musie-card").whenInViewport(function() {
        $("#musie-card").addClass("animated slideInRight");
    });





});

