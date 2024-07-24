// check email is allowed before sending to email.js

document.addEventListener('navbar-loaded', function() {
    document.getElementById('signup-button').addEventListener('click', function() {
        const email = document.getElementById('email-input').value;
        if (validateEmail(email)) {
            // send email to email.js
            fetch('/signup/emailVerified', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('You have successfully Signed-up!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        else {
            alert("Please enter a valid email address");
        }
    });
});

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
