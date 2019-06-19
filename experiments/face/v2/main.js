import Clam from './clmtracker';

// console.log(Clam.init());
Clam.init();

document.getElementById('startbutton').addEventListener('click', function () {
	Clam.startVideo();
});

