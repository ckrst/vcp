(function($) {


	$.fn.bchess = function(options) {
		//debug(this);

		// build main options before element iteration
		var opts = $.extend({}, $.fn.bchess.defaults, options);

		var lins = $.fn.bchess.lines;
		var cols = $.fn.bchess.cols;

		var step = 0;
		var fromSquare = '';
		var toSquare = '';

		// iterate and reformat each matched element
		return this.each(function() {
			$this = $(this);
			// build element specific options

			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

			var fen = $this.find('.fen').html();

			var fen_array = fen.split('/');


			var pgn = $this.find('.pgn').html();
			var pgn_array = pgn.split(';');


			var html = '';
			var square_color_index = 0;


			var selectPiece = function(elem){
				resetPlay();
				clearSquares();
				if(o.plays == 'white'){
					if($(elem).hasClass('whitePiece')){


						$(elem).parent().addClass('currentPiece');
						fromSquare = $(elem).parent().attr('id');
						getValidSquares($(elem).parent().attr('id'));
					}
				} else if(o.plays == 'black'){
					if($(elem).hasClass('blackPiece')){

						$(elem).parent().addClass('currentPiece');
						fromSquare = $(elem).parent().attr('id');
						getValidSquares($(elem).parent().attr('id'));
					}
				}
			};

			var capture = function(elem) {
				if($(elem).children().hasClass('whitePiece')){
					$(elem).children().remove().appendTo('#whiteReserve').wrap('<li class="reserveSquare latestReserve whiteReserve" />');
				} else {
					$(elem).children().remove().appendTo('#blackReserve').wrap('<li class="reserveSquare latestReserve blackReserve" />');
				}
				movePiece(elem);
			};

			var movePiece = function(elem){
				step = 2;
				$('.currentPiece').children().remove().appendTo(elem);
				clearSquares();
				$(elem).addClass('currentPiece');
				toSquare = $('.currentPiece').attr('id');

				$('#txtToSquare').val(toSquare);

				$('#btnSubmit').attr('disabled', false);
			};

			var resetPlay = function (){
				if('' != toSquare){
					$('#' + toSquare).children().remove().appendTo('#' + fromSquare);

					if($('.latestReserve').length > 0){
						$('.latestReserve').children().remove().appendTo('#' + toSquare);
						$('.latestReserve').remove();
					}
				}

				step = 0;
				fromSquare = '';
				toSquare = '';

				$('#piecePreview').html('');
				$('#txtFromSquare').val('');
				$('#txtToSquare').val('');
				$('#btnSubmit').attr('disabled', true);
			};

			var applyMoves = function (){
				if(pgn.length > 0) {
					var ori;
					var des;
					for(var i = 0; i < pgn_array.length; i++){
						var pgn_move = pgn_array[i];
						var pgn_move_array = pgn_move.split('-');
						ori = pgn_move_array[0];
						des = pgn_move_array[1];

						$('#' + des).children().each(function() {
							if($(this).hasClass('whitePiece')){
								$(this).remove().appendTo('#whiteReserve').wrap('<li class="reserveSquare whiteReserve" />');
							} else {
								$(this).remove().appendTo('#blackReserve').wrap('<li class="reserveSquare blackReserve" />');
							}
						});

						$('#' + ori).children().remove().appendTo($('#'+des));
					}
					$('#' + ori).addClass('latestMove');
					$('#' + des).addClass('latestMove');

				}

			};

			var reverseBoard = function(){

				dp1 = o.boardh - 1;
				for(var i = 0; i < o.boardh/2; i++){
					dp2 = o.boardw - 1;
					for(j = 0; j  < o.boardw; j++){

						td1 = '#td' + i + j;

						td2 = '#td' + dp1 + dp2;

						sq = $(td2).children().remove();
						$(td1).children().remove().appendTo(td2);
						sq.appendTo(td1);



						dp2--;
					}
					dp1--;
				}

			};


			html += '<table cellspacing="0" cellpadding="0" id="tbl_' + $(this).attr('id') + '">';
			for(var i = (o.boardh - 1); i >= 0; i--){
				html += '<tr>';

				var fen_line = fen_array[i];
				var fen_squares = fen_line.split(';');

				for(j = 0; j  < o.boardw; j++){
					html += '<td class="blackColor" id="td' + i + j + '">';

					//var square_color = (((square_color_index++) %  2) == 0) ? o.wcolor : o.bcolor;
					var square_class = (((square_color_index++) %  2) == 0) ? 'white' : 'black';

					var sqid = cols[j] + lins[i];

					html += '<div id="'+sqid+'" class="square ' + square_class + '" style="width: '+o.square_size+'px; height: '+o.square_size+'px;">';
					//html += sqid+'<BR>';

					if(o.show_labels){
						html += '<small>' + i + ' - ' + j + '</small>';
					}

					if(fen_squares[j] != '0'){
						//html += fen_squares[j];

						var classes = fen_squares[j].split('_');

						var img_size = o.square_size - 2;
						var img_html = ' <img id="" src="'
							+ o.images_path +  fen_squares[j]
							+ '" width="'+img_size
							+ '" height="'+img_size
							+ '" title="' + fen_squares[j]
							+ '" class="piece ' + classes[0]+'Piece' + ' ' + classes[1] + '" /> ';

						html += img_html;
					} else {
						html += '';
					}

					html += '</div>';

					html += '</td>';
				}
				html += '</tr>';
				square_color_index++;
			}
			html += '</table>';
			$this.html(html);


			resetPlay();

			if(o.view == "black"){
				reverseBoard();
			}

			applyMoves();

			$('.square').click(function(){

				if($(this).children().length > 0){


					if(o.plays == o.view){
						if ($(this).hasClass('validSquare')) {
							capture(this);
						} else {
							selectPiece($(this).children().get(0));
						}
					}
				} else {
					if($(this).hasClass('validSquare')) {
						movePiece(this);
					} else {
						clearSquares();
						resetPlay();
					}
				}

			});



			var getValidSquares = function(id){
				$.ajax({
					type: 'POST',
					url: 'http://revolver/chess_battles/index.php/arena/valid_moves/15/',
					data: 'square='+id,
					dataType: 'text',
					success: function(response_text){
						$('.square').addClass('invalidSquare');
						if('' != response_text){

							$('#piecePreview').html($('#' + fromSquare).children().clone());
							$('#txtFromSquare').val(fromSquare);
							$('#txtToSquare').val('');

							var valid_squares = response_text.split(';');

							for(var i = 0; i < valid_squares.length; i++){
								$('#' + valid_squares[i]).removeClass('invalidSquare');
								$('#' + valid_squares[i]).addClass('validSquare');
							}




						}
					}
				});
			};

		});
	};
	//
	// private function for debugging
	//
	function debug($obj) {
		if (window.console && window.console.log) {
			window.console.log('hilight selection count: ' + $obj.size());
		}
	};

	function clearSquares(){
		$('.square').removeClass('currentPiece');
		$('.square').removeClass('validSquare');
		$('.square').removeClass('invalidSquare');

	};



	/*
	//
	// define and expose our format function
	//
	$.fn.hilight.format = function(txt) {
		return '<strong>' + txt + '</strong>';
	};*/

	$.fn.bchess.hilight_square = function(id, color){
		$(id).css('border','1px solid '+color);
	};





	//
	// plugin defaults
	//
	$.fn.bchess.defaults = {
		foreground: 'red',
		background: 'yellow',

		//bcolor: 'DDDDDD',
		//wcolor: 'EEEEEE',
		square_size: 60,
		boardw: 8,
		boardh: 8,
		images_path: 'img/',
		show_labels: false,
		plays: 'viewer',
		view: 'white'
	};

	$.fn.bchess.cols = {
		0 : 'a',
		1 : 'b',
		2 : 'c',
		3 : 'd',
		4 : 'e',
		5 : 'f',
		6 : 'g',
		7 : 'h'
	};

	$.fn.bchess.lines = {
		0 : '1',
		1 : '2',
		2 : '3',
		3 : '4',
		4 : '5',
		5 : '6',
		6 : '7',
		7 : '8'
	};


})(jQuery);
