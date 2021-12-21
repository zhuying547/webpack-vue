import { printMsg } from './print.js'

function component() {
  const el = document.createElement('button')
  el.innerHTML = 'See Console'
  el.addEventListener('click', printMsg)

  return el
}

document.body.appendChild(component())