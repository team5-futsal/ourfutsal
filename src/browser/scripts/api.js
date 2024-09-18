// fetch API 기능에 대한 함수들이 모여있습니다.

/** 계정 로그인 API 호출 */
export async function loginAccount(body) {
    return fetch('/api/account/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then(res => {
        // 401 코드에 대한 실패 처리
        if (res.status === 401) {
            alert('존재하지 않는 아이디이거나 비밀번호가 일치하지 않습니다.');
        }

        // 정상적인 응답 처리
        else if (res.status === 200) {
            return res.json();
        }

        // 기타 상태 코드에 대한 처리
        else return alert('500 Server Error');
    });
}

export async function registAccount(body) {
    return fetch('/api/account/regist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    // .then(res => {
    //     if (res.status === 409)
    // })
}

export async function getAccounts() {
    return fetch('/api/account/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}
