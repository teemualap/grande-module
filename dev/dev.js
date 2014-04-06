// normally you would just 'npm install grande-module' and
// require('grande-module')
var grande = require('../src/js/grande-module.js');

var article = document.createElement('article');

// provide omitted tags as a comma separated string
grande.bind(article,null,"h3,h4,h5");
document.body.appendChild(article);

var buttons = document.createElement('div');
buttons.className = 'example-buttons';

var rebindBtn = document.createElement('button');
rebindBtn.textContent = "Rebind";
rebindBtn.disabled = true;
buttons.appendChild(rebindBtn);
rebindBtn.addEventListener('click',function(){
	//this time do not omit any tags
	grande.bind(article);
	rebindBtn.disabled = true;
	disposeBtn.disabled = false;
});

var disposeBtn = document.createElement('button');
disposeBtn.textContent = "Dispose";
buttons.appendChild(disposeBtn);
disposeBtn.addEventListener('click',function(){
	grande.dispose();
	disposeBtn.disabled = true;
	rebindBtn.disabled = false;
});

document.body.appendChild(buttons);