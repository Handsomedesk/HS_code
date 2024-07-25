const db = require('../db');

exports.getMyInfo = (req, res) => {
  const query = `
    SELECT 
      user.user_id, user.login_id, user.nick_name, user.password, user.create_time, user.update_time, user.user_intro, user.pw_update_time, user.pw_find,
      pet.pet_name, pet.pet_breed, pet.pet_age, pet.pet_intro
    FROM user 
    LEFT JOIN pet ON user.user_id = pet.user_id
    WHERE user.login_id = ?
  `;
  db.query(query, [req.session.login_id], (err, results) => {
    if (err) {
      console.error("내 정보 조회 중 에러 발생: ", err);
      res.status(500).send('서버 에러');
      return;
    }

    const userInfo = results.length > 0 ? results[0] : {};
    res.render('myinfo', { myInfos: [userInfo] });
  });
};

exports.updateMyInfo = (req, res) => {
  const { user_id, nick_name, user_intro, pet_name, pet_breed, pet_age, pet_intro } = req.body;

  const userQuery = 'UPDATE user SET nick_name = ?, user_intro = ?, update_time = NOW() WHERE user_id = ?';
  const petQuery = 'SELECT * FROM pet WHERE user_id = ?';

  db.query(userQuery, [nick_name, user_intro,user_id], (err, result) => {
    if (err) {
      console.error("내 정보 수정 중 에러 발생: ", err);
      return res.status(500).send('서버 에러');
    }

    db.query(petQuery, [user_id], (err, petResults) => {
      if (err) {
        console.error("반려동물 조회 중 에러 발생: ", err);
        return res.status(500).send('서버 에러');
      }

      if (petResults.length > 0) {
        const updatePetQuery = 'UPDATE pet SET pet_name = ?, pet_breed = ?, pet_age = ?, pet_intro = ? WHERE user_id = ?';
        db.query(updatePetQuery, [pet_name, pet_breed, pet_age, pet_intro, user_id], (err, result) => {
          if (err) {
            console.error("반려동물 정보 수정 중 에러 발생: ", err);
            return res.status(500).send('서버 에러');
          }
          res.send('<script>alert("정보 수정 성공!"); window.location.href = "/myinfo";</script>');
        });
      } else {
        const insertPetQuery = 'INSERT INTO pet (pet_name, pet_breed, pet_age, pet_intro, user_id) VALUES (?, ?, ?, ?, ?)';
        db.query(insertPetQuery, [pet_name, pet_breed, pet_age, pet_intro, user_id], (err, result) => {
          if (err) {
            console.error("반려동물 등록 중 에러 발생: ", err);
            return res.status(500).send('서버 에러');
          }
          res.send('<script>alert("정보 수정 성공!"); window.location.href = "/myinfo";</script>');
        });
      }
    });
  });
};
