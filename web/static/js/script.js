"use strict";

function fetchMessage() {
  let div = document.createElement('div');
  div.className = "alert";
  div.innerHTML = "<strong>Всем привет!</strong> Вы прочитали важное сообщение.";
  document.getElementById('first_div').append(div);
}