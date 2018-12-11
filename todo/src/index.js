import React from 'react'
import {render} from 'react-dom'

function createLi(){
    let qwe = 'qwe'
    return(<li className={qwe} style={{float: 'center', color: 'red'}}>listelem</li>)
}

function asd(){
    return (
        <div>
            <h1>asd</h1>
        </div>
    )
}

render(asd(), document.getElementById('someDiv'));
render (createLi(), document.getElementById('list'));