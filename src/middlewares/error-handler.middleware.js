export default function (err, req, res, next) {
  console.error(err);
  let errorMessage = ''
  let status = 500

  // Joi 검증에서 에러가 발생하면, 클라이언트에게 에러 메시지를 전달합니다.
  switch(err.name){
    case 'ValidationError':
      status = 412

      switch(err.message.match(/(?<=\").+?(?=\")/)[0]){
        case 'userId':
          errorMessage = "아이디의 형식이 일치하지 않습니다. (영어 소문자 + 숫자)"
          break;
        case 'password':
          errorMessage = "패스워드 형식이 일치하지 않습니다. (6~40자리)"
          break;
        case 'name':
          errorMessage = "이름 형식이 일치하지 않습니다. (2~15자리 특수문자 포함불가)"
          break;
        case 'health':
          errorMessage = "health 형식이 일치하지 않습니다. ( <1000)"
          break;
        case 'power':
          errorMessage = "power 형식이 일치하지 않습니다. ( <1000)"
          break;
        case 'stat':
          errorMessage = "stat 형식이 일치하지 않습니다."
          break;
        case 'price':
          errorMessage = "가격 형식이 일치하지 않습니다. ( <10,000)"
          break;
        default:
          errorMessage = "요청한 데이터 형식이 올바르지 않습니다."
          status = 400
      }
      return res.status(status).json({ errorMessage: errorMessage });

    case 'SyntaxError':
      return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다" });

    case 'PrismaClientKnownRequestError':
      return res.status(400).json({ errorMessage: "중복된 장비 사용은 불가합니다." });

    default:
      // 그 외의 에러가 발생하면, 서버 에러로 처리합니다.
      return res
        .status(500)
        .json({ errorMessage: '서버에서 에러가 발생하였습니다.' });
  }
}