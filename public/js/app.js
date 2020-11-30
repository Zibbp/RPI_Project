document.addEventListener('submit', function (event) {

	// Prevent form from submitting to the server
	event.preventDefault();

    // Create data object from submitted form entries
    const data = Object.fromEntries(new FormData(event.target))

    // Create JSON body for the POST request
    const postBody = { color: data.color, brightness: data.brightness}

    // Execute POST request
    fetch('/set', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(postBody)
    })
    .then(response => console.log(response))

});

$('#red').click(function (e) {
    post('FF0000')
})
$('#orange').click(function (e) {
    post('ffa500')
})
$('#yellow').click(function (e) {
    post('ffff00')
})
$('#green').click(function (e) {
    post('00ff00')
})
$('#teal').click(function (e) {
    post('008080')
})
$('#blue').click(function (e) {
    post('0000ff')
})
$('#violet').click(function (e) {
    post('ee82ee')
})
$('#purple').click(function (e) {
    post('9400D3')
})
$('#pink').click(function (e) {
    post('FF69B4')
})
$('#white').click(function (e) {
    post('ffffff')
})


$(document).on('input', '#brightnessSlider', function() {
    post(null, $(this).val())
});


function post(color, brightness) {

    const postBody = { color, brightness }

    fetch('/set', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(postBody)
    })
}