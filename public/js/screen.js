function UserInterface() {
	var self = this;
	
	this.headerVisible = true;
	
	this.updateFrames = function() {
		console.log('Updating Frames');
		var layout = window.state.settings.layout;
		
		var frame;
		
		if (window.state.isSlideshow) {
			console.log('Is Slideshow');
			this.hideHeader();
			
			if (layout == "0") {
				frame = $('<div>').addClass('row').addClass('full-height');
				frame.append( $('<div>').attr('id', 'slideshow').addClass('col-md-10').addClass('full-height') );
				frame.append( $('<div>').attr('id', 'ticker').addClass('col-md-2').addClass('full-height') );
			}
			else if (layout == "1") {
				frame = $('<div>').addClass('full-height');
				frame.append( $('<div>').attr('id', 'slideshow').addClass('layout1-slideshow') );
				frame.append( $('<div>').attr('id', 'ticker').addClass('layout1-ticker') );
			}
			else if (layout == "2") {
				frame = $('<div>').attr('id', 'slideshow').addClass('layout2-slideshow');
			}
		}
		else {
			console.log('Is Ticker');
			this.showHeader();
			frame = $('<div>').attr('id', 'ticker').addClass('full-height');
		}
		
		this.resetFrame();
		$( '#frame' ).append(frame);
		self.addExistingTicks();
	};

	this.renderSlide = function(message) {
		this.updateFrames();
		$('#slideshow').append( $('<div>').append($(message.content)).addClass('auto-margin'));
	};
	
	this.renderTick = function(message) {
		var tick = $('<p class="message"></p>');
		tick.html(message.content);
		
		$('#ticker').prepend(tick);
		$('#ticker').find('p').slice(50).remove();
	};
	
	this.addExistingTicks = function() {
		window.state.messages.forEach(function (message) {
			if (message.type === 'tick') {
				self.renderTick(message);
			}
		});
	};

	this.setStatus = function(message, karma) {
		console.log('Status:', message, karma);

		$('#status').text(message);
		$('#status').removeClass('bad good neutral');
		$('#status').addClass(karma);
	};
	
	this.showHeader = function() {
		if (window.state.ui.headerVisible === false) {
			window.state.ui.headerVisible = true;
			$('#header').toggle(2000);
		}
	};
	
	this.hideHeader = function() {
		if (window.state.ui.headerVisible === true) {
			window.state.ui.headerVisible = false;
			$('#header').toggle(2000);
		}
	};

	this.resetFrame = function() {
		$( '#frame' ).remove();
		$( 'body' ).append( '<div id="frame"></div>' );
	};

	/*this.displayMessage = function(message) {
		console.log('displaying message: ', message);
		
		currentMsgStart = Math.floor(Date.now() / 1000);
		
		switch (message.type) {
			case 'text':
				$( "#frame" ).prepend(self.renderMessage(message));
				break;
			case 'shoutout':
				$( "#frame" ).prepend(self.renderMessage(message)); // add to template
				break;
			default:
				break;
		}
	};*/

	return this;
}

function Sound() {
	this.init = function() {
		var alarm = document.getElementById('alarm');
		alarm.src = '/sounds/204424__jaraxe__alarm-3.wav';
	};
	
	this.play = function() {
		var alarm = document.getElementById('alarm');
		alarm.play();
	};
}

function ConnectionHandler() {
	var self = this;

    this.socket = io.connect();

	this.setupSocketHandlers = function() {
		self.socket.on('connect', function() {
			window.state.ui.setStatus('Connected', 'good');
		});

		self.socket.on('disconnect', function() {
			window.state.ui.setStatus('Disconnected', 'bad');
			window.state.ui.resetFrame();
		});
		
		self.socket.on('messages', function(data) {
			console.log('Recv Messages', data);

			data.messages.forEach(function(message) {
				window.state.ui.displayMessage(message);
				window.state.sound.play();
			});
		});
	};

	this.init = function() {
		this.setupSocketHandlers();
	};

	return this;
}

function State() {
	this.connectionHandler = new ConnectionHandler();
	this.ui = new UserInterface();
	this.sound = new Sound();
    this.messages = [];

	return this;
}

function init() {     
	window.state = new State();
    window.state.ui.resetFrame();
	window.state.connectionHandler.init();
	window.state.sound.init();

	setInterval(tick, 2000); // ms between checks
}

function tick() {
	var timeNow = Math.floor(Date.now() / 1000);
	
	state = window.state;

	if (state.messages.notEmpty()) {
		nextMessage = state.messages.lastItem();
	} else {
		return;
	}
	
	console.log(nextMessage);
	
	if ((timeNow - currentMsgStart) >= nextMessage.delay) {
		console.log('Display Next', nextMessage);
		
		displayMessage(nextMessage);
	}
} 
