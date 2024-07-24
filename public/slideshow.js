document.addEventListener('navbar-loaded', function (){

    document.querySelector('.prev').addEventListener('click', function() {
        plusSlides(-1);
        let slides = document.querySelectorAll('.slideshow-images');
        slides[slideIndex - 1].classList.add('slide-in-left');
    });

    document.querySelector('.next').addEventListener('click', function() {
        plusSlides(1);
        let slides = document.querySelectorAll('.slideshow-images');
        slides[slideIndex - 1].classList.add('slide-in-right');
    });


    let slideIndex = 1;
    showSlides(slideIndex);

    // Next/previous controls
    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    // Thumbnail image controls
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides(n) {

        let i;
        let slides = document.getElementsByClassName("slideshow-images");
        let dots = document.getElementsByClassName("dot");

        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}

        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            if (slides[i].classList.contains('slide-in-left')) {
                slides[i].classList.remove('slide-in-left');
            }
            if (slides[i].classList.contains('slide-in-right')) {
                slides[i].classList.remove('slide-in-right');
            }
        }

        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        slides[slideIndex-1].style.display = "block";

        if (slides[slideIndex-1].classList.contains('slide-in-left')) {
            dots[slideIndex-1].className += " active";
        }

        dots[slideIndex-1].className += " active";
    }
})
