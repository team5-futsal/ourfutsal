/** 공통으로 작동하는 기능입니다. */

/** api 버튼을 누르면 Request 창이 토글형식으로 작동하도록 하는 함수 */

export function handleApiButtonClick(event) {
    event.preventDefault(); // 기본 동작 방지
    const apiRequestDiv = document.querySelector('.apiRequest');

    const apiSendBtn = `<div>
                <button type="apiButton" id="${event}sendReqBtn">확인</button>
            </div>`;
            
    // 클릭한 버튼의 텍스트 가져오기 (예: "계정 조회")
    const clickedButtonName = event.target.textContent;

    // 새로운 버튼의 ID와 텍스트 설정
    const newButtonId = clickedButtonName.replace(/\s+/g, '') + 'SendReqBtn'; // 공백 제거 후 ID 생성
    const newButtonText = clickedButtonName + ' - Send Request';

    // 이미 추가된 버튼이 없는지 확인
    if (!document.getElementById(newButtonId)) {
        // 동적으로 버튼 생성
        const sendRequestBtn = document.createElement('button');
        sendRequestBtn.id = newButtonId;
        sendRequestBtn.textContent = newButtonText;

        // 버튼 클릭 시 동작할 로직 추가 (예시)
        sendRequestBtn.addEventListener('click', () => {
            const params = document.getElementById('reqParams').value;
            const body = document.getElementById('reqBody').value;
            console.log('Sending request for:', clickedButtonName, 'with params:', params, 'and body:', body);

            // 여기서 실제로 API 호출 로직을 추가할 수 있습니다.
        });

        // apiRequest 하단에 버튼 추가
        apiRequestDiv.appendChild(sendRequestBtn);
    }

    // 공통적으로 apiRequest 창을 토글
    apiRequestDiv.classList.toggle('show');
}
