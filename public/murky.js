// implement sonner API for pop ups


document.addEventListener("DOMContentLoaded", function() {
    fetch('/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        // Now that the navbar is loaded, we can safely add event listeners to the elements within it.


        // custom event so other JS files only run after the navbar is loaded
        document.dispatchEvent(new CustomEvent('navbar-loaded'));

        let menu = document.querySelector('#mobile-menu');
        let menuLinks = document.querySelector('.navbar-content');
        let navbar = document.querySelector('.navbar');
        menu.addEventListener('click', function() {
            menu.classList.toggle('is-active');
            menuLinks.classList.toggle('active');
            if (window.scrollY == 0) {
                navbar.classList.toggle('navbar-scrolled');
            }
        });


        let navbarScroll = window.addEventListener('scroll', function(){
            console.log("Scroll event triggered");
            let navbar = document.getElementById('navbar');
            let navbarContent = document.querySelector('.navbar-content');

            if (window.scrollY > 0) {

                navbar.classList.add('navbar-scrolled');
            }
            else {
                if (navbarContent.classList.contains('active')){
                    return;
                }
                else {
                    navbar.classList.remove('navbar-scrolled');
                }
            }
        });

        let dropdownButtons = document.querySelectorAll('.dropdown-button');
        let artistContents = document.querySelectorAll('.artist-content');
        let closeButtons = document.querySelectorAll('.close-artist-content');

        dropdownButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                artistContents[index].style.display = 'flex'; // Show the artist content
                closeButtons[index].style.display = 'block'; // Show the close button
                button.style.display = 'none'; // Hide the dropdown button
            });
        });

        closeButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                artistContents[index].style.display = 'none'; // Hide the artist content
                button.style.display = 'none'; // Hide the close button
                dropdownButtons[index].style.display = 'block'; // Show the dropdown button again
            });
        });

    })
    .then(() => {
        console.log('top')
        window.scrollTo(0,0);
    })
    .catch(error => {
        console.error('Error fetching the navbar:', error);
    });

});
