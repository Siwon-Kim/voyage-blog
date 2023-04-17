# voyage-blog

## Node.js HW1 Questions
1.  수정, 삭제 API에서 Resource를 구분하기 위해서 Request를 어떤 방식으로 사용하셨나요? (`params`, `query`, `body`)
    1. `params`는 라우터의 매개변수로서 url에 `/:id`와 같이 되어 있는 값을 `req.params.id`로 가져올 수 있다.
    2. `query`는 쿼리 문자열 매개 변수에 대한 속성이 포함된 개체로서 url에 `?`나 `&`와 같이 사용된다. (`/user?name=Siwon-Kim&age=24`)
    3. `body`는 JSON 등의 바디 데이터를 담을 때 사용한다.
    <br />  
    
    * posts의 PUT, DELETE method API에서는 body안에서 JSON형식으로 입력된 비밀번호를 
      posts DB에 들어있는 게시물의 비밀번호와 비교하기 위해
      `const { password } = req.body;`로 body의 password를 가져왔다.
    * comments의 PUT, DELETE method API에서는 posts와 마찬가지로 비밀번호를 body를 통해 가져왔고,
      어떤 post의 comment인지 확인하기 위해 `const { _postId } = req.params;`를 통해 postId의 값을 가져왔다.
<br />  

2.  HTTP Method의 대표적인 4가지는 `GET`, `POST`, `PUT`, `DELETE` 가있는데 각각 어떤 상황에서 사용하셨나요?
    * GET: DB에 담겨 있는 posts나 comments 데이터의 값을 가져올 때
    * POST: client가 posts나 comments를 입력하고 그 값을 DB에 저장할 때
    * PUT: client가 posts나 comments를 수정하고 그 수정된 값을 DB에 반영할 때
    * DELETE: client가 posts나 comments를 DB에서 삭제하고 싶을 때
<br /> 

3.  RESTful한 API를 설계했나요? 어떤 부분이 그런가요? 어떤 부분이 그렇지 않나요?
    * RESTful한 API를 설계하였습니다. REST의 CRUD인 GET, POST, PUT, DELETE 메서드를 각각의 역할에 맞게 사용하였고, 
      리소스가 명사형 url을 통해 잘 식별되고 있다. 
<br /> 

4.  역할별로 Directory Structure를 분리하였을 경우 어떠한 이점이 있을까요?
    * 각 리소스에 해당하는 미들웨어를 분리시켜 재사용성이 높다 (모듈화).
    * 각 리소스의 의존성을 파악하기에 편리하다.

