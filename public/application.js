document.getElementById('1').addEventListener('submit',async (event)=>{
    event.preventDefault();
    console.log(event.target);
    let value = event.target.querySelector('[name="pipeline"]').value;
    console.log(value);


    const response = await fetch (`/dashboard`,{
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({id: value})

    })
    const data = await response.text();

});


