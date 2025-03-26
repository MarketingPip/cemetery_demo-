const formData = {
    name: "John Doe",
    email: "",
    message: "Hello, this is a test message x4.",
    subject: "Hey man!"
};
////
fetch('https://youtube.marketingpipeliners.com/contactform.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(formData).toString()
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log(data.message); // "Thank you for your message."
    } else {
        console.error(data.message); // e.g., "Invalid email address."
    }
})
.catch(error => console.error('Error:', error));////////////
