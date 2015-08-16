$( window ).load( function () {

	$( 'body' ).keydown( function (evt) {
		// For debugging
		// console.log(evt.keyCode);

		// Force the command field to capture input
		$('input#command').focus();

		// Ctrl-l page reload (clear screen)
		if (evt.ctrlKey && evt.keyCode === 76) {
			location.reload();
		}

		// Ctrl-u clear input field
		if (evt.ctrlKey && evt.keyCode === 85) {
			$('input#command').val('');
		}

	});


});
