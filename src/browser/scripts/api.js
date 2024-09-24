// fetch API 기능에 대한 함수들이 모여있습니다.

import { refreshAccessToken } from '../services/generate.js';

const fetchAPI = (method, url, body, isAuthorization) => {
    console.log(`${url} 요청중...`);
    return new Promise((resolve, reject) => {
        const reqObj = {};
        const headers = { 'Content-Type': 'application/json' };

        // 인증이 필요한경우 액세스토큰이 만료되었는지 확인한다.
        if (isAuthorization) {
            const accessAuth = `Bearer ${getAccessToken()}`;

            refreshAccessToken(accessAuth)
                .then(res => {
                    if (res) {
                        console.log(`새로운 토큰을 발급받았습니다. ${res}`);
                        setAccessToken(res);
                        headers['authorization'] = `Bearer ${getAccessToken()}`;
                    }
                    if (!res) {
                        console.log('토큰 유지합니다.');
                        headers['authorization'] = `Bearer ${getAccessToken()}`;
                    }
                })
                .then(() => {
                    if (body !== null) {
                        reqObj['body'] = JSON.stringify(body);
                    }
                    reqObj['method'] = method;
                    reqObj['headers'] = headers;
                    reqObj['credentials'] = 'include';

                    return fetch(url, reqObj);
                })
                .then(res => {
                    console.log(res);
                    resolve(res);
                })
                .catch(error => reject(error));
        } else {
            if (body !== null) {
                reqObj['body'] = JSON.stringify(body);
            }
            reqObj['method'] = method;
            reqObj['headers'] = headers;
            reqObj['credentials'] = 'include';

            return fetch(url, reqObj)
                .then(res => resolve(res))
                .catch(error => reject(error));
        }
    });
};

/** 계정 로그인 API 호출 */
export async function loginAccount(body) {
    const res = await fetchAPI('POST', '/api/account/login', body, false);
    // 유효성 검증 실패
    if (res.status === 401) {
        alert('비밀번호가 일치하지 않습니다.');
    }
    if (res.status === 404) {
        alert('아이디가 존재하지 않습니다.');
    }
    return res.json();
}

/** 계정 가입 API 호출 */
export async function registAccount(body) {
    const res = await fetchAPI('POST', '/api/account/regist', body, false);
    if (res.status === 201) {
        alert('회원가입 성공! 로그인 화면으로 이동합니다.');
        return true;
    } else if (res.status === 409) {
        alert('이미 존재하는 아이디입니다.');
        return false;
    } else if (res.status === 412) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return false;
    } else {
        alert('500 Server Error');
        return false;
    }
}

/** 모든 계정 조회 API 호출 */
export async function getAccountAll() {
    const res = await fetchAPI('GET', '/api/account/all', null, false);
    if (res.status === 200) return res.json();
    else return alert('500 Server Error');
}

/** 내 계정 조회 API 호출 */
export async function getAccountInfo() {
    const res = await fetchAPI('GET', '/api/account', null, true);
    if (res.status === 200)
        return res.json(); // data 객체가 반환될것임.
    else return alert('500 Server Error');
}

/** 계정 수정 API 호출 */
export async function updateAccount(body) {
    const res = await fetchAPI('PUT', '/api/account', body, true);
    if (res.status === 201) return true;
    else return false;
}

/** 계정 삭제 API 호출 */
export async function deleteAccount() {
    const res = await fetchAPI('DELETE', '/api/account', null, true);
    if (res.status === 201) return res.json();
    else return alert('500 Server Error');
}

/** 계정 로그아웃 API 호출 */
export async function logoutAccount() {
    const res = await fetchAPI('GET', '/api/account/logout', null, true);
    if (res.status === 200) {
        return true;
    }
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
    const body = { playerId: bodydata };
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

export async function matchGame(body = null) {
    const res = await fetchAPI('POST', '/api/custom', body, true);
    return res.json();
}

export async function runCustomGame(body) {
    const res = await fetchAPI('POST', '/api/match/team', body, true);
    if (res.status === 200) {
        return res.json();
    } else return false;
}
