// npm install express cors dotenv mysql 실행하고 쓸것
const express = require('express');
const cors = require('cors');
require('dotenv').config();  // 키 보안용
const app = express();
const port = 8080;
app.use(cors());

const mysql = require('mysql');

// AWS RDS MySQL 데이터베이스 연결 정보
const connection = mysql.createConnection({  
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PW,
  database: process.env.AWS_DB
});

async function DBConnect(){  // 데이터 베이스 연결
  connection.connect(function(err) {
    if (err) { 
      console.error('Error connect RDS MySQL connection:', err);
    } 
    else { 
      console.log('RDS MySQL connected!');
    }
  });
}

function DBEnd(){  // 데이터베이스 연결 종료
  connection.end((err) => {
    if (err) {
      console.error('Error closing RDS MySQL connection:', err);
      return;
    }else{ console.log('RDS MySQL connection closed!'); }    
  });
}

// Datastore가 초기화된 후에 서버를 시작
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
  DBConnect();
});

app.get('/', (req, res) => {
  res.send('Welcome aws rds connected api');
});

// 프론트에서 해당 API를 사용하는 코드 // 프론트에서는 npm install axios 할것!!
// await Axios.get(`API 기본주소(대체로 http나 https로 시작함)/aws/Upload?매개변수명=${매개변수값}&매개변수명2=${매개변수값2}`)
// .then(response => {
//   alert("API 작동 성공");
// })
// .catch(error => console.error('Error comment fetching data:', error));

// 특정 테이블에 값(row, 행)을 삽입
app.get('/aws/Upload', (req, res) => {
  // postcode 쿼리 매개변수 추출
  const code = req.query.code;  // 예시   ..../aws/Upload?매개변수명=${매개변수값} 의 것을 가져온다.
  
  const query = `INSERT INTO member (code) VALUES (?)`;  // db의 member table에 데이터(row 행) 삽입.
  const values = [code];

  connection.query(query, values, (err) => {
    if (err) {
      console.error('Error aws db table Loading:', err);
      res.status(500).json({ error: 'Error aws db table Loading' });  
    } else {
      console.log('업로드 성공');
      res.status(200).json({ success: '성공' });  // 성공결과 json으로 반환
    }
  });
});

// 특정 테이블에 값(row, 행)을 검색하고 프론트로 출력
app.get('/aws/Search', (req, res) => {
  const keyword = req.query.code;

  const query = `SELECT * FROM member WHERE keyword = ?`; // 코드에 해당하는 데이터를 검색하는 쿼리
  const values = [keyword];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error aws db table Searching:', err);
      res.status(500).json({ error: 'Error aws db table Searching' });  
    } else {
      console.log('검색 성공');
      res.status(200).json(results); // keyword로 매개로 검색한 결과를 JSON 형식으로 반환
    }
  });
});

// 특정 테이블에 값(row, 행)을 삭제
app.get('/aws/Delete', (req, res) => {
  const code = req.query.code;

  const query = `DELETE FROM member WHERE code = ?`; // 코드에 해당하는 데이터를 삭제하는 쿼리
  const values = [code];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error aws db table Deleting:', err);
      res.status(500).json({ error: 'Error aws db table Deleting' });  
    } else {
      console.log('삭제 성공');
      res.status(200).json({ success: '삭제 성공' }); // 성공 메시지를 JSON 형식으로 반환
    }
  });
});
