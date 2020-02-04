document.getElementById('first').addEventListener('submit',async (event)=>{
    event.preventDefault();
    console.log(event.target);
    let subdomain = event.target.querySelector('[name="subdomain"]').value;
    let amoEmail = event.target.querySelector('[name="amoEmail"]').value;
    let key = event.target.querySelector('[name="key"]').value;

    console.log(subdomain, amoEmail, key);


    const response = await fetch (`/dashboard`,{
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ subdomain, amoEmail, key })

    })


    const data = await response.json();
    console.log(data.response)
    if (!data.response) {
        console.log('false')
        alert('Incorrect data, please try again.')
    } else window.location.href='/dashboard/authorized'

});




document.getElementById('second').addEventListener('submit',async (event)=> {
    event.preventDefault();
    console.log(event.target.parentElement);
    let pipelineId = event.target.querySelector('[name="pipelineId"]').value;
    const response = await fetch(`/leadscs`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({pipelineId})
    })
    const data = await response.text();
    console.log(data)
    event.target.parentElement.innerHTML=data

})