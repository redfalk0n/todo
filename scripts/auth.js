const xhr = new XMLHttpRequest();

function auth(){
    let username = document.getElementById('login').value;
    let pass = document.getElementById('pass').value;
    xhr.open('POST', '/auth', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    let data = 'username=' + encodeURIComponent(username) +
        '&password=' + encodeURIComponent(pass);
    xhr.send(data);
    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4) return;
        if (xhr.response === 'Unauthorized'){
            alert('Неправильный логин или пароль!')
        } else if (xhr.response){
            localStorage.setItem('token', xhr.response);
            document.location.href = '/tdl';
        } else {
            alert('Неизвестная ошибка!')
        }
    };
}

document.body.onkeyup = function (e) {
    if (e.keyCode === 13) {
        auth();
    }
};