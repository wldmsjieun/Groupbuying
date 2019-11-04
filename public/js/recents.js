var userModuel=require('./Queue')
function setCookie(cookie_name, value, days) {  //cookie 설정하는 함수
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + days);
    // 설정 일수만큼 현재시간에 만료값으로 지정
  
    var cookie_value = escape(value) + ((days == null) ? '' : ';    expires=' + exdate.toUTCString());
    document.cookie = cookie_name + '=' + cookie_value;
  }


function addCookie(id) {
    var items = getCookie('productItems'); // 이미 저장된 값을 쿠키에서 가져오기
    var maxItemNum = 4; // 최대 저장 가능한 아이템개수
    var expire = 7; // 쿠키값을 저장할 기간
    queue=Queue();
    if (items) {
      queue._arr = items.split(',');
      if (queue.isElement == ture) {
        // 이미 존재하는 경우 종료
        console.log('Already exists.');
      }
      else {
        // 새로운 값 저장 및 최대 개수 유지하기
        queue.enqueue(id);
        if (queue.length > maxItemNum ) queue.dequeue;
        items = itemArray.join(',');
        setCookie('productItems', items, expire);
      }
    }
    else {
      // 신규 id값 저장하기
      setCookie('productItems', id, expire);
    }
}



function getCookie(cookie_name) { //cookie를 가져오는 함수
    var x, y;
    var val = document.cookie.split(';');
  
    for (var i = 0; i < val.length; i++) {
      x = val[i].substr(0, val[i].indexOf('='));
      y = val[i].substr(val[i].indexOf('=') + 1);
      x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
      if (x == cookie_name) {
        return unescape(y); // unescape로 디코딩 후 값 리턴
      }
    }
}

exports.setCookie = setCookie;