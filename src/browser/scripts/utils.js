/** 공통으로 작동하는 기능입니다. */

/** api 버튼을 누르면 Request 창이 토글형식으로 작동하도록 하는 함수 */
export function handleApiButtonClick(event) {
    event.preventDefault(); // 기본 동작 방지
    doDisplay(true); // 이게 다시 입력을 안받음.. 왜이런거지....
    const apiRequestDiv = document.querySelector('.apiRequestBtn');
    // apiRequest 클래스 하단에 버튼이 있는지 확인한다.
    // 버튼이 있다면 삭제
    if (apiRequestDiv.children[0]) {
        apiRequestDiv.removeChild(apiRequestDiv.children[0]);
    }

    // 버튼이 없다면 ${clickedButtonName} 이름의 버튼 생성
    // 여기서 새로 생성된 버튼에 동작을 주려면 새로운 변수에 담지 않고,
    // createElement를 담은 변수에 addEventListener를 넣어줘야 동작함.
    const sendRequestBtn = document.createElement('button');
    sendRequestBtn.id = event.target.id + 'ResSendBtn';
    sendRequestBtn.textContent = 'Send Request';
    sendRequestBtn.type = 'apiButton';
    apiRequestDiv.appendChild(sendRequestBtn);
}

export function doDisplay(isDisplay) {
    // const reqResContainer = document.getElementsByClassName('reqResContainer');
    // if (isDisplay) 
    //     reqResContainer.style['display'] = 'flex';
    // else reqResContainer.style['display'] = 'none';
    const apiReqRes = document.getElementsByName('apiReqRes');
    // const reqResContainer = document.getElementById('reqResContainer');
    if (isDisplay) {
        console.log('보여지게 함')
        apiReqRes[0].style.display = '';
        apiReqRes[1].style.display = '';
        
    }
    else {
        console.log('안보여지게 함')
        apiReqRes[0].style.display = 'none';
        apiReqRes[1].style.display = 'none';
        // reqResContainer.style.display = 'none'
    };
}