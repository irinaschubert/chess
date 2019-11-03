/** representing the start page functionalities
 *  @author Irina
 *
 * */

'use strict';

(function($) {
    $(document).ready(function(){
        getSelection();
    });

    function getSelection() {
        $("#popup-choose").removeClass("hide");
        $("#new-game-button").click((e) => {
            startNewGame();
        });

        $("#load-game-button").click((e) => {
            loadGame();
        });
    }

    function startNewGame(){
        window.location.href = 'index.html';
    }

    function loadGame(){
        $("#load-game-panel").removeClass("hide");
    }

})(jQuery);

