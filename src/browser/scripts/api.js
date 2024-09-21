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
        // 정상적인 응답 처리
        if (res.status === 200) {
            return res.json();
        }
        // 기타 상태 코드에 대한 처리
        else return false;
    });
}

/** 계정 가입 API 호출 */
export async function registAccount(body) {
    return fetch('/api/account/regist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }).then(res => {
        if (res.status === 201) {
            alert('회원가입 성공! 로그인 화면으로 이동합니다.');
            return true;
        } else if (res.status === 409) {
            alert('이미 존재하는 아이디입니다.');
            return false;
        } else {
            alert('500 Server Error');
            return false;
        }
    });
}

/** 모든 계정 조회 API 호출 */

export async function getAccountAll() {
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

/** 내 계정 조회 API 호출 */
export async function getAccountInfo() {
    return fetch('/api/account', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then(res => {
        if (res.status === 200)
            return res.json(); // data 객체가 반환될것임.
        else return alert('500 Server Error');
    });
}

/** 계정 수정 API 호출 */
export async function updateAccount(body) {
    return fetch(`/api/account`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
    }).then(res => {
        if (res.status === 201) return res.json();
        else return alert('500 Server Error');
    });
}

/** 계정 삭제 API 호출 */
export async function deleteAccount() {
    return fetch(`/api/account`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then(res => {
        if (res.status === 201) return res.json();
        else return alert('500 Server Error');
    });
}

/** 계정 로그아웃 API 호출 */
export async function logoutAccount() {
    return fetch('/api/account/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then(res => {
        if (res.status === 200) {
            localStorage.removeItem('token');
            return true;
        }
    });
}

// 본인의 팀 편성 조회
export async function getTeam() {
    return fetch('/api/team/myfind', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

// 본인의 팀 편성 제외
export async function excludeTeam(bodydata) {
    const body = { playerId: bodydata };
    return fetch('/api/team/exclude', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

// 본인의 팀 편성 모두 제외
export async function excludeTeamAll() {
    return fetch('/api/team/empty', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

// user 의 팀 편성 조회
export async function getUserTeam(param) {
    return fetch(`/api/team/find/${param}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

// 본인의 팀 편성 추가
export async function updateTeam(bodydata) {
    const body = { rosterId: bodydata };
    return fetch(`/api/team/add/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

// 본인의 보유 선수 조회
export async function getMyPlayer(bodydata) {
    return fetch(`/api/roster`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

// 본인의 보유 선수 판매
export async function sellMyPlayer(bodydata) {
    const body = { rosterId: bodydata };
    return fetch(`/api/roster/sell`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
    }).then(res => {
        if (res.status === 201) return res.json();
        else return alert('500 Server Error');
    });
}

/** 선수 목록 API 호출 */
export async function getPlayers() {
    return fetch('/api/players', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}

/** 선수 상세 정보 API 호출 */
export async function getPlayerDetail(playerName) {
    return fetch(`/api/players/${playerName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res.status === 200) return res.json();
        else return alert('500 Server Error');
    });
}
