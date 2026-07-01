    alert('this is the default startup')
    let cockNate = localStorage.getItem("cockNate");
    let cockSeed = localStorage.getItem("UnsafecockSeed")
    if(cockNate){
    if(cockSeed){
    let form = document.createElement("form");
    form.method = "POST";
    form.action = "/login";

    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "usernameL";
    input.value = cockNate;

    let input2 = document.createElement("input");
    input2.type = "hidden";
    input2.name = "passwordL"
    input2.value = cockSeed;
        
    form.appendChild(input);
    form.appendChild(input2)
    document.body.appendChild(form);
    form.submit()
        }else{
            window.location.href = "/login"
        }
    } else{
        window.location.href = "/login"
    }