
const getFormatDate = (date) => {
  let year = date.getFullYear();
  let month = (1 + date.getMonth());
  month = month >= 10 ? month : '0' + month;
  let day = date.getDate();
  day = day >= 10 ? day : '0' + day;
  const result = `${year}-${month}-${day}`
  return result;
}

// 몽고디비의 경우 기본 시간대 설정 때문에 9시간의 오차가 발생한다. 그래서 이를 해결하기 위한 방법으로
// 디비쪽 세팅을 하거나, 아니면 다음과 같이 서버에서 두 번째 해결방안은 직접 데이터를 지정하여 넣는 것인데요, 
// 저는 다음과 같은 함수를 구현하였습니다.


const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
  // return new Date(year, month, today, hours, minutes, seconds, milliseconds);
}

export {
  getFormatDate,
  getCurrentDate
}