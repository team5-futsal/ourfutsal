export default {
    matching: {
        userInfo:{
            status: 404,
            message: "유저 정보가 없습니다."
        },
        activePlayers:{
            status: 412,
            message: "선출 인원이 부족합니다."
        }
    },
    team: {
        userInfo:{
            status: 409,
            message: " 존재하지 않는 유저 입니다. "
        }
    }
}